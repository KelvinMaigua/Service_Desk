using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceDesk.Data;
using ServiceDesk.Models;
using ServiceDesk.Models.DTOs;

namespace ServiceDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ServiceDeskContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TicketsController(ServiceDeskContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // GET: api/tickets/me - Ver mis tickets (Usuario)
        [HttpGet("me")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetMyTickets()
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized();

            var tickets = await _context.Tickets
                .Where(t => t.UserId == userId)
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    TicketNumber = t.TicketNumber,
                    Title = t.Title,
                    Description = t.Description,
                    CategoryId = t.CategoryId,
                    ServiceId = t.ServiceId,
                    StatusId = t.StatusId,
                    PriorityId = t.PriorityId,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // GET: api/tickets/all - Ver todos los tickets (Solo Soporte)
        [HttpGet("all")]
        [Authorize(Roles = "Support,Admin")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetAllTickets()
        {
            var tickets = await _context.Tickets
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    TicketNumber = t.TicketNumber,
                    Title = t.Title,
                    Description = t.Description,
                    CategoryId = t.CategoryId,
                    ServiceId = t.ServiceId,
                    StatusId = t.StatusId,
                    PriorityId = t.PriorityId,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // GET: api/tickets/{id} - Detalle del ticket
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicketDetail(int id)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            var ticket = await _context.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Category)
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
                return NotFound();

            // Verificar permisos: solo el dueño o soporte pueden verlo
            if (ticket.UserId != userId && userRole != "Support" && userRole != "Admin")
                return Forbid();

            return Ok(ticket);
        }

        // POST: api/tickets - Crear ticket
        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId == 0)
                return Unauthorized();

            // Validar que la categoría existe
            var category = await _context.Categories.FindAsync(request.CategoryId);
            if (category == null)
                return BadRequest("Categoría no válida");

            // Validar que el servicio existe
            var service = await _context.Services.FindAsync(request.ServiceId);
            if (service == null)
                return BadRequest("Servicio no válido");

            // Generar número de ticket único
            var ticketNumber = "TKT-" + DateTime.UtcNow.Ticks;

            var ticket = new Ticket
            {
                TicketNumber = ticketNumber,
                Title = request.Title,
                Description = request.Description,
                UserId = userId,
                CategoryId = request.CategoryId,
                ServiceId = request.ServiceId,
                PriorityId = request.PriorityId,
                StatusId = 1, // Open
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTicketDetail), new { id = ticket.Id }, new TicketDto
            {
                Id = ticket.Id,
                TicketNumber = ticket.TicketNumber,
                Title = ticket.Title,
                Description = ticket.Description,
                CategoryId = ticket.CategoryId,
                ServiceId = ticket.ServiceId,
                StatusId = ticket.StatusId,
                PriorityId = ticket.PriorityId,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt
            });
        }

        // PATCH: api/tickets/{id}/status - Actualizar estado (Solo Soporte)
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Support,Admin")]
        public async Task<IActionResult> UpdateTicketStatus(int id, [FromBody] Dictionary<string, int> body)
        {
            if (!body.TryGetValue("statusId", out var newStatusId))
                return BadRequest("Se requiere statusId");

            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
                return NotFound();

            var oldStatusId = ticket.StatusId;
            ticket.StatusId = newStatusId;
            ticket.UpdatedAt = DateTime.UtcNow;

            // Registrar cambio en historial
            var history = new TicketHistory
            {
                TicketId = id,
                ChangedByUserId = GetCurrentUserId(),
                FieldName = "StatusId",
                OldValue = oldStatusId.ToString(),
                NewValue = newStatusId.ToString(),
                ChangedAt = DateTime.UtcNow
            };

            _context.TicketHistories.Add(history);
            await _context.SaveChangesAsync();

            return Ok(ticket);
        }

        private int GetCurrentUserId()
        {
            var claim = _httpContextAccessor.HttpContext?.User
                .FindFirst("UserId");
            return claim != null ? int.Parse(claim.Value) : 0;
        }

        private string GetCurrentUserRole()
        {
            return _httpContextAccessor.HttpContext?.User
                .FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "";
        }
    }
}
