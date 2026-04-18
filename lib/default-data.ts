import type { FAQ, Testimonial, Video } from "@/lib/types";

export const defaultVideos: Omit<Video, "id">[] = [
  {
    title: "Tech Review | Cinematic Edit",
    category: "long",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  },
  {
    title: "Gaming Highlights Reel",
    category: "long",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  },
  {
    title: "Short Form · Instagram Reel",
    category: "short",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  },
  {
    title: "Motion Graphics Promo",
    category: "long",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  },
  {
    title: "YouTube Long-Form Edit",
    category: "long",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  },
  {
    title: "Brand Ad · Short Form",
    category: "short",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  },
  {
    title: "Reel Edit · Trending Audio",
    category: "short",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  },
  {
    title: "YouTube Documentary Edit",
    category: "long",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    yt: "dQw4w9WgXcQ"
  }
];

export const defaultTestimonials: Omit<Testimonial, "id">[] = [
  {
    name: "Technical Sagar",
    sub: "3.14M Subscribers",
    text: "Been working with Noi Editors for over 6 months. Clean edits, fast delivery, and a smooth workflow. Highly recommend!",
    avatar: "TS"
  },
  {
    name: "I Love Jamnagar",
    sub: "429K Followers",
    text: "Really good experience working with Noi Editors. Everything was smooth and the output quality was solid.",
    avatar: "IJ"
  },
  {
    name: "Cyber Sagar",
    sub: "64.1K Subscribers",
    text: "Communication was smooth, edits were clean, and delivery was always on time. No complications at all.",
    avatar: "CS"
  }
];

export const defaultFaqs: FAQ[] = [
  {
    q: "What is your editing process?",
    a: "We receive your raw footage, understand your vision, edit with precision, and deliver within the agreed timeline. We keep you updated at every step."
  },
  {
    q: "How can I send you the footage?",
    a: "You can share footage via Google Drive, WeTransfer, or any cloud storage. We'll send you a link once the project is confirmed."
  },
  {
    q: "What if I'm not satisfied with the edit?",
    a: "We offer unlimited revisions until you're 100% happy. Your satisfaction is our priority."
  },
  {
    q: "Can you deliver within 24 hours?",
    a: "Yes! For urgent projects we offer 24H express delivery. Contact us to confirm availability."
  },
  {
    q: "How do I get started?",
    a: "Simply click \"Get In Touch\", describe your project, and we'll get back to you within a few hours."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, Bank Transfer (India), and PayPal / Wise (International clients)."
  }
];
