using System;

namespace ServiceDesk.Models
{
    public class TicketComment
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Ticket Ticket { get; set; }
        public User User { get; set; }
    }
}
