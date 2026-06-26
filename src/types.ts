export interface User {
  _id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Pet {
  _id: string;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  age: string;
  ageGroup: "baby" | "young" | "adult" | "senior";
  gender: "male" | "female";
  size: "small" | "medium" | "large";
  description: string;
  status: "available" | "pending" | "adopted";
  imageUrl: string;
  contactInfo: {
    phone: string;
    email: string;
    location: string;
  };
  listedBy: string;
  listedByName: string;
  createdAt: string;
}

export interface AdoptionRequest {
  _id: string;
  petId: string;
  petName: string;
  petImageUrl: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  petId: string;
  createdAt: string;
}
