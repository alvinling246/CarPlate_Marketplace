using System.Text.Json.Serialization;

namespace CarPlateAPI.Models
{
    public class DealerUpsertRequest
    {
        [JsonPropertyName("fullName")]
        public string? FullName { get; set; }

        [JsonPropertyName("phoneNumber")]
        public string? PhoneNumber { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("username")]
        public string? Username { get; set; }

        [JsonPropertyName("password")]
        public string? Password { get; set; }

        [JsonPropertyName("isActive")]
        public bool? IsActive { get; set; }
    }
}

