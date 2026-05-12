using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ServiceDesk.Data;
using ServiceDesk.Models;
using ServiceDesk.Models.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace ServiceDesk.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ServiceDeskContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ServiceDeskContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new LoginResponse
                {
                    Success = false,
                    Message = "Email y contraseña son requeridos"
                });
            }

            // Buscar usuario
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                return Unauthorized(new LoginResponse
                {
                    Success = false,
                    Message = "Email o contraseña incorrectos"
                });
            }

            // Verificar contraseña
            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new LoginResponse
                {
                    Success = false,
                    Message = "Email o contraseña incorrectos"
                });
            }

            // Generar token JWT
            var token = GenerateJwtToken(user);

            return Ok(new LoginResponse
            {
                Success = true,
                Message = "Login exitoso",
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role
                },
                Token = token
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new LoginResponse
                {
                    Success = false,
                    Message = "Email y contraseña son requeridos"
                });
            }

            // Verificar si el usuario ya existe
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return BadRequest(new LoginResponse
                {
                    Success = false,
                    Message = "El email ya está registrado"
                });
            }

            // Crear nuevo usuario
            var user = new User
            {
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = HashPassword(request.Password),
                Role = "Student", // Rol por defecto
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generar token JWT
            var token = GenerateJwtToken(user);

            return Ok(new LoginResponse
            {
                Success = true,
                Message = "Registro exitoso",
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role
                },
                Token = token
            });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyForJWTThatIsAtLeast32CharactersLong!";
            var expiryMinutesStr = jwtSettings["ExpiryMinutes"] ?? "1440";
            
            var key = Encoding.ASCII.GetBytes(secretKey);
            var expiryMinutes = int.Parse(expiryMinutesStr);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(new[]
                {
                    new System.Security.Claims.Claim("UserId", user.Id.ToString()),
                    new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Email, user.Email),
                    new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, user.Role),
                    new System.Security.Claims.Claim("FirstName", user.FirstName),
                    new System.Security.Claims.Claim("LastName", user.LastName)
                }),
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == hash;
        }
    }
}
