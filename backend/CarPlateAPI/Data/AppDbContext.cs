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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Plate>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PlateNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Category).HasMaxLength(50);
                entity.Property(e => e.AddedDate).HasDefaultValueSql("GETDATE()");
            });
        }
    }
}
