export interface EventType {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: EventType[] = [
  {
    image: "/images/event1.png",
    title: "React Conf 2023",
    slug: "react-conf-2023",
    location: "San Francisco, CA",
    date: "2023-10-15",
    time: "09:00 AM",
  },
  {
    image: "/images/event2.png",
    title: "TypeScript Summit",
    slug: "typescript-summit",
    location: "New York, NY",
    date: "2023-11-20",
    time: "02:00 PM",
  },
  {
    image: "/images/event3.png",
    title: "Next.js Hackathon",
    slug: "nextjs-hackathon",
    location: "Austin, TX",
    date: "2023-12-05",
    time: "10:00 AM",
  },
  {
    image: "/images/event4.png",
    title: "Node.js World Conference",
    slug: "nodejs-world-conference",
    location: "Seattle, WA",
    date: "2024-01-15",
    time: "08:30 AM",
  },
  {
    image: "/images/event5.png",
    title: "Frontend Developer Meetup",
    slug: "frontend-developer-meetup",
    location: "Remote",
    date: "2024-02-10",
    time: "06:00 PM",
  },
  {
    image: "/images/event6.png",
    title: "DevOps Days",
    slug: "devops-days",
    location: "Boston, MA",
    date: "2024-03-22",
    time: "01:00 PM",
  },
];
