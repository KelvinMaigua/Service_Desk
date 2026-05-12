using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceDesk.Data;
using ServiceDesk.Models;

namespace ServiceDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ServiceDeskContext _context;

        public CategoriesController(ServiceDeskContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .ToListAsync();
            return Ok(categories);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ServicesController : ControllerBase
    {
        private readonly ServiceDeskContext _context;

        public ServicesController(ServiceDeskContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetServices()
        {
            var services = await _context.Services
                .Where(s => s.IsActive)
                .Include(s => s.Category)
                .ToListAsync();
            return Ok(services);
        }

        [HttpGet("by-category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Service>>> GetServicesByCategory(int categoryId)
        {
            var services = await _context.Services
                .Where(s => s.CategoryId == categoryId && s.IsActive)
                .ToListAsync();
            return Ok(services);
        }
    }
}
