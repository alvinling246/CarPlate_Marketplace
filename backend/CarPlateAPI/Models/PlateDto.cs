namespace CarPlateAPI.Models
{
    /// <summary>Plate response shape for API; includes reserved/sold info from Reservation/Sale + Buyer.</summary>
    public class PlateDto
    {
        public int Id { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Status { get; set; } = "Available";
        public int? BuyerId { get; set; }
        public string? Category { get; set; }
        public DateTime AddedDate { get; set; }
        public string? SoldReservedBy { get; set; }
        public DateTime? ReservedDate { get; set; }
        public DateTime? SoldDate { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
    }
}
