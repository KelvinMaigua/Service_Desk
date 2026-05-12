using System;
using System.Collections.Generic;

namespace ServiceDesk.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        public ICollection<Service> Services { get; set; } = new List<Service>();
    }
}
