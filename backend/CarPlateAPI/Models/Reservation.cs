namespace CarPlateAPI.Models
{
    /// <summary>Reservation of a plate by a buyer. Status: e.g. Active, Expired, Converted to Sale.</summary>
    public class Reservation
    {
        public int Id { get; set; }
        public int PlateNoId { get; set; }
        public int BuyerId { get; set; }
        public DateTime ReservedDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Status { get; set; } = "Active";

        public Plate Plate { get; set; } = null!;
        public Buyer Buyer { get; set; } = null!;
    }
}
