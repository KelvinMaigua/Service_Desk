using System;
using System.Collections.Generic;

namespace ServiceDesk.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Category Category { get; set; }
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
