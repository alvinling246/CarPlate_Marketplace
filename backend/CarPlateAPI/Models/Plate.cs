namespace CarPlateAPI.Models
{
    public class Plate
    {
        public int Id { get; set; }
        public string PlateNumber { get; set; } = string.Empty;
        public decimal Price { get; set; }
        /// <summary>One of: Available, Reserved, Sold</summary>
        public string Status { get; set; } = "Available";
        public string? Category { get; set; }
        public DateTime AddedDate { get; set; }
        public string? SoldReservedBy { get; set; }
        public DateTime? ReservedDate { get; set; }
        public DateTime? SoldDate { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
    }
}
