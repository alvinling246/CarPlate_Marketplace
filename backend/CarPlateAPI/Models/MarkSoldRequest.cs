namespace CarPlateAPI.Models
{
    public class UpdatePlateRequest
    {
        public string? PlateNumber { get; set; }
        public string? Category { get; set; }
        public decimal? Price { get; set; }
    }

    public class MarkSoldRequest
    {
        public string? SoldReservedBy { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
        public DateTime? SoldDate { get; set; }
    }

    public class MarkReserveRequest
    {
        public DateTime? ReservedDate { get; set; }
        public string? SoldReservedBy { get; set; }
        public string? ContactNumber { get; set; }
        public string? Email { get; set; }
    }
}
