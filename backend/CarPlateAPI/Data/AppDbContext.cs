using Microsoft.EntityFrameworkCore;
using CarPlateAPI.Models;

namespace CarPlateAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Plate> Plates { get; set; }
        public DbSet<Dealer> Dealers { get; set; }
        public DbSet<Buyer> Buyers { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Sale> Sales { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // dbo.dealers
            modelBuilder.Entity<Dealer>(entity =>
            {
                entity.ToTable("Dealers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("GETDATE()");
                entity.HasIndex(e => e.Username).IsUnique();
            });

            // dbo.plates - BuyerId FK to Buyers; column order in DB: Id, PlateNumber, Price, BuyerId, Category, AddedDate, Status
            modelBuilder.Entity<Plate>(entity =>
            {
                entity.ToTable("Plates");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PlateNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Category).HasMaxLength(50);
                entity.Property(e => e.AddedDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Available");
                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // dbo.buyers - optional many-to-one to Dealer (FullName/PhoneNumber/Email nullable when DealerId is set)
            modelBuilder.Entity<Buyer>(entity =>
            {
                entity.ToTable("Buyers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FullName).HasMaxLength(200);
                entity.Property(e => e.PhoneNumber).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.HasOne(e => e.Dealer)
                    .WithMany()
                    .HasForeignKey(e => e.DealerId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // dbo.reservation - PlateNoId -> Plates, BuyerId -> Buyers
            modelBuilder.Entity<Reservation>(entity =>
            {
                entity.ToTable("Reservation");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ReservedDate).HasColumnType("datetime");
                entity.Property(e => e.ExpiryDate).HasColumnType("datetime");
                entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("Active");
                entity.HasOne(e => e.Plate)
                    .WithMany()
                    .HasForeignKey(e => e.PlateNoId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // dbo.sales - PlateNoId -> Plates, BuyerId -> Buyers, ReservationId -> Reservation (nullable)
            modelBuilder.Entity<Sale>(entity =>
            {
                entity.ToTable("Sales");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.SoldDate).HasColumnType("datetime");
                entity.Property(e => e.SoldPrice).HasColumnType("decimal(18,2)");
                entity.HasOne(e => e.Plate)
                    .WithMany()
                    .HasForeignKey(e => e.PlateNoId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Buyer)
                    .WithMany()
                    .HasForeignKey(e => e.BuyerId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Reservation)
                    .WithMany()
                    .HasForeignKey(e => e.ReservationId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}
