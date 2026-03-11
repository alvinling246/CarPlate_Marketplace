using System.Text.Json.Serialization;

namespace CarPlateAPI.Models
{
    public class AdminLoginRequest
    {
        [JsonPropertyName("username")]
        public string? Username { get; set; }

        [JsonPropertyName("password")]
        public string? Password { get; set; }
    }
}

