using System;
using System.Collections.Generic;

namespace ServiceDesk.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public string TicketNumber { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int UserId { get; set; }
        public int CategoryId { get; set; }
        public int ServiceId { get; set; }
        public int StatusId { get; set; }
        public int PriorityId { get; set; }
        public int? AssignedToId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        // Navigation properties
        public User CreatedBy { get; set; }
        public User AssignedTo { get; set; }
        public Category Category { get; set; }
        public Service Service { get; set; }
        public TicketStatus Status { get; set; }
        public Priority Priority { get; set; }
        public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
        public ICollection<TicketHistory> History { get; set; } = new List<TicketHistory>();
    }
}
