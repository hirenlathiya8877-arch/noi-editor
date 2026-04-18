export type Video = {
  id: string;
  title: string;
  category: string;
  thumb?: string | null;
  yt?: string | null;
  mp4?: string | null;
};

export type Testimonial = {
  id: string;
  name: string;
  sub: string;
  text: string;
  avatar: string;
};

export type Client = {
  id: string;
  name: string;
  username: string;
  password: string;
};

export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "REVIEW" | "DONE";

export type Project = {
  id: string;
  title: string;
  status: ProjectStatus;
  video?: string | null;
  notes?: string | null;
  clientId: string;
  createdAt: string | Date;
};

export type FAQ = {
  q: string;
  a: string;
};
