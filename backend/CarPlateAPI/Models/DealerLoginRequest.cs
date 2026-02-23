using System.Text.Json.Serialization;

namespace CarPlateAPI.Models
{
    public class DealerLoginRequest
    {
        [JsonPropertyName("username")]
        public string? Username { get; set; }
        [JsonPropertyName("password")]
        public string? Password { get; set; }
    }
}
