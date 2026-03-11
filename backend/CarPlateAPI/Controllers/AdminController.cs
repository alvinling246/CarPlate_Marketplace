using System.Text;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarPlateAPI.Data;
using CarPlateAPI.Models;

namespace CarPlateAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowReactApp")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Admin/login
        [HttpPost("login")]
        public async Task<ActionResult<object>> Login([FromBody] AdminLoginRequest request)
        {
            var username = request?.Username?.Trim() ?? "";
            var password = request?.Password ?? "";

            if (string.IsNullOrEmpty(username))
                return BadRequest(new { message = "Username is required." });
            if (string.IsNullOrEmpty(password))
                return BadRequest(new { message = "Password is required." });

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Role == "Admin" && u.Username.ToLower() == username.ToLower());

            if (user == null)
                return Unauthorized(new { message = "Invalid username or password." });
            if (!user.IsActive)
                return Unauthorized(new { message = "This admin account is inactive." });

            var storedPassword = user.Password?.Trim() ?? "";
            if (storedPassword != password.Trim())
                return Unauthorized(new { message = "Invalid username or password." });

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Lightweight token for UI gating (not a signed JWT)
            var payloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                userId = user.Id,
                username = user.Username,
                role = user.Role,
                exp = DateTimeOffset.UtcNow.AddHours(8).ToUnixTimeSeconds()
            });
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadJson));

            return Ok(new { token, userId = user.Id, username = user.Username, role = user.Role });
        }
    }
}

