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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Plate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PlateNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Available");
                entity.Property(e => e.Category).HasMaxLength(50);
                entity.Property(e => e.AddedDate).HasDefaultValueSql("GETDATE()");
                entity.Property(e => e.SoldReservedBy).HasMaxLength(200);
                entity.Property(e => e.ReservedDate).HasColumnType("date");
                entity.Property(e => e.SoldDate).HasColumnType("date");
                entity.Property(e => e.ContactNumber).HasMaxLength(50);
                entity.Property(e => e.Email).HasMaxLength(100);
            });

            modelBuilder.Entity<Dealer>(entity =>
            {
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
        }
    }
}
