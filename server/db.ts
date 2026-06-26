import fs from "fs";
import path from "path";
import { MongoClient, Db } from "mongodb";

// Types
export interface User {
  _id: string;
  username: string;
  passwordHash: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export interface Pet {
  _id: string;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string;
  age: string; // e.g. "2 months", "1 year"
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
  listedBy: string; // User ID
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

export interface Session {
  _id: string;
  userId: string;
  username: string;
  name: string;
  createdAt: string;
}

// Memory database fallback (JSON File Storage)
class JSONDatabase {
  private dataDir = path.join(process.cwd(), "data");
  private paths = {
    users: path.join(process.cwd(), "data", "users.json"),
    pets: path.join(process.cwd(), "data", "pets.json"),
    requests: path.join(process.cwd(), "data", "requests.json"),
    favorites: path.join(process.cwd(), "data", "favorites.json"),
    sessions: path.join(process.cwd(), "data", "sessions.json"),
  };

  constructor() {
    this.ensureDirectory();
    this.ensureFiles();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private ensureFiles() {
    Object.entries(this.paths).forEach(([key, filePath]) => {
      if (!fs.existsSync(filePath)) {
        let initialData: any[] = [];
        if (key === "pets") {
          initialData = SEED_PETS;
        }
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), "utf-8");
      }
    });
  }

  private read<T>(type: keyof typeof this.paths): T[] {
    try {
      this.ensureDirectory();
      const filePath = this.paths[type];
      if (!fs.existsSync(filePath)) {
        this.ensureFiles();
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Error reading database ${type}:`, e);
      return [];
    }
  }

  private write<T>(type: keyof typeof this.paths, data: T[]) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(this.paths[type], JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error(`Error writing database ${type}:`, e);
    }
  }

  // Generic Operations
  async find<T>(collection: keyof typeof this.paths, query: Partial<T> = {}): Promise<T[]> {
    const items = this.read<T>(collection);
    return items.filter((item: any) => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
  }

  async findOne<T>(collection: keyof typeof this.paths, query: Partial<T>): Promise<T | null> {
    const items = this.read<T>(collection);
    const found = items.find((item: any) => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
    return found || null;
  }

  async insertOne<T>(collection: keyof typeof this.paths, doc: Omit<T, "_id"> & { _id?: string }): Promise<T> {
    const items = this.read<T>(collection);
    const newDoc = {
      ...doc,
      _id: doc._id || Math.random().toString(36).substring(2, 15),
    } as unknown as T;
    items.push(newDoc);
    this.write(collection, items);
    return newDoc;
  }

  async updateOne<T>(collection: keyof typeof this.paths, query: Partial<T>, update: Partial<T>): Promise<boolean> {
    const items = this.read<T>(collection);
    const index = items.findIndex((item: any) => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
    if (index === -1) return false;
    items[index] = { ...items[index], ...update };
    this.write(collection, items);
    return true;
  }

  async deleteOne<T>(collection: keyof typeof this.paths, query: Partial<T>): Promise<boolean> {
    const items = this.read<T>(collection);
    const index = items.findIndex((item: any) => {
      return Object.entries(query).every(([key, value]) => item[key] === value);
    });
    if (index === -1) return false;
    items.splice(index, 1);
    this.write(collection, items);
    return true;
  }
}

// Mongo implementation
class MongoDatabase {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(private uri: string) {}

  async connect() {
    if (this.client) return;
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db();
      console.log("Connected successfully to MongoDB");
      // Seed if empty
      const petsCount = await this.db.collection("pets").countDocuments();
      if (petsCount === 0) {
        await this.db.collection("pets").insertMany(SEED_PETS);
        console.log("Seeded initial pets to MongoDB");
      }
    } catch (e) {
      console.error("Failed to connect to MongoDB, falling back to local storage:", e);
      this.client = null;
      this.db = null;
    }
  }

  get isConnected() {
    return this.db !== null;
  }

  async find<T>(collection: string, query: any = {}): Promise<T[]> {
    if (!this.db) throw new Error("Database not connected");
    const items = await this.db.collection(collection).find(query).toArray();
    return items.map(item => ({ ...item, _id: item._id.toString() })) as unknown as T[];
  }

  async findOne<T>(collection: string, query: any): Promise<T | null> {
    if (!this.db) throw new Error("Database not connected");
    const item = await this.db.collection(collection).findOne(query);
    if (!item) return null;
    return { ...item, _id: item._id.toString() } as unknown as T;
  }

  async insertOne<T>(collection: string, doc: any): Promise<T> {
    if (!this.db) throw new Error("Database not connected");
    const docToInsert = { ...doc };
    if (!docToInsert._id) {
      docToInsert._id = Math.random().toString(36).substring(2, 15);
    }
    await this.db.collection(collection).insertOne(docToInsert);
    return docToInsert as T;
  }

  async updateOne<T>(collection: string, query: any, update: any): Promise<boolean> {
    if (!this.db) throw new Error("Database not connected");
    const result = await this.db.collection(collection).updateOne(query, { $set: update });
    return result.modifiedCount > 0 || result.matchedCount > 0;
  }

  async deleteOne<T>(collection: string, query: any): Promise<boolean> {
    if (!this.db) throw new Error("Database not connected");
    const result = await this.db.collection(collection).deleteOne(query);
    return result.deletedCount > 0;
  }
}

// Smart manager routing requests dynamically
class DatabaseManager {
  private jsonDb = new JSONDatabase();
  private mongoDb: MongoDatabase | null = null;

  constructor() {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      console.log("Initializing MongoDB adapter with provided URI...");
      this.mongoDb = new MongoDatabase(mongoUri);
      this.mongoDb.connect().catch(err => {
        console.error("Async MongoDB connection failed, fallback ready", err);
      });
    } else {
      console.log("No MONGODB_URI environment variable set. Running in Local Storage Mode.");
    }
  }

  private get useMongo(): boolean {
    return this.mongoDb !== null && this.mongoDb.isConnected;
  }

  // Users
  async getUsers(query: Partial<User> = {}): Promise<User[]> {
    if (this.useMongo) return this.mongoDb!.find<User>("users", query);
    return this.jsonDb.find<User>("users", query);
  }

  async getUser(query: Partial<User>): Promise<User | null> {
    if (this.useMongo) return this.mongoDb!.findOne<User>("users", query);
    return this.jsonDb.findOne<User>("users", query);
  }

  async createUser(user: Omit<User, "_id" | "createdAt">): Promise<User> {
    const fullUser = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    if (this.useMongo) return this.mongoDb!.insertOne<User>("users", fullUser);
    return this.jsonDb.insertOne<User>("users", fullUser);
  }

  // Pets
  async getPets(query: Partial<Pet> = {}): Promise<Pet[]> {
    if (this.useMongo) return this.mongoDb!.find<Pet>("pets", query);
    return this.jsonDb.find<Pet>("pets", query);
  }

  async getPet(query: Partial<Pet>): Promise<Pet | null> {
    if (this.useMongo) return this.mongoDb!.findOne<Pet>("pets", query);
    return this.jsonDb.findOne<Pet>("pets", query);
  }

  async createPet(pet: Omit<Pet, "_id" | "createdAt">): Promise<Pet> {
    const fullPet = {
      ...pet,
      createdAt: new Date().toISOString(),
    };
    if (this.useMongo) return this.mongoDb!.insertOne<Pet>("pets", fullPet);
    return this.jsonDb.insertOne<Pet>("pets", fullPet);
  }

  async updatePet(id: string, update: Partial<Pet>): Promise<boolean> {
    if (this.useMongo) return this.mongoDb!.updateOne("pets", { _id: id }, update);
    return this.jsonDb.updateOne("pets", { _id: id }, update);
  }

  async deletePet(id: string): Promise<boolean> {
    if (this.useMongo) return this.mongoDb!.deleteOne("pets", { _id: id });
    return this.jsonDb.deleteOne("pets", { _id: id });
  }

  // Adoption Requests
  async getRequests(query: Partial<AdoptionRequest> = {}): Promise<AdoptionRequest[]> {
    if (this.useMongo) return this.mongoDb!.find<AdoptionRequest>("requests", query);
    return this.jsonDb.find<AdoptionRequest>("requests", query);
  }

  async createRequest(request: Omit<AdoptionRequest, "_id" | "createdAt">): Promise<AdoptionRequest> {
    const fullRequest = {
      ...request,
      createdAt: new Date().toISOString(),
    };
    if (this.useMongo) return this.mongoDb!.insertOne<AdoptionRequest>("requests", fullRequest);
    return this.jsonDb.insertOne<AdoptionRequest>("requests", fullRequest);
  }

  async updateRequest(id: string, update: Partial<AdoptionRequest>): Promise<boolean> {
    if (this.useMongo) return this.mongoDb!.updateOne("requests", { _id: id }, update);
    return this.jsonDb.updateOne("requests", { _id: id }, update);
  }

  // Favorites
  async getFavorites(query: Partial<Favorite> = {}): Promise<Favorite[]> {
    if (this.useMongo) return this.mongoDb!.find<Favorite>("favorites", query);
    return this.jsonDb.find<Favorite>("favorites", query);
  }

  async addFavorite(favorite: Omit<Favorite, "_id" | "createdAt">): Promise<Favorite> {
    const fullFav = {
      ...favorite,
      createdAt: new Date().toISOString(),
    };
    if (this.useMongo) return this.mongoDb!.insertOne<Favorite>("favorites", fullFav);
    return this.jsonDb.insertOne<Favorite>("favorites", fullFav);
  }

  async removeFavorite(userId: string, petId: string): Promise<boolean> {
    if (this.useMongo) return this.mongoDb!.deleteOne("favorites", { userId, petId });
    return this.jsonDb.deleteOne("favorites", { userId, petId });
  }

  // Sessions (Simple backend auth)
  async getSession(token: string): Promise<Session | null> {
    if (this.useMongo) return this.mongoDb!.findOne<Session>("sessions", { _id: token });
    return this.jsonDb.findOne<Session>("sessions", { _id: token });
  }

  async createSession(userId: string, username: string, name: string): Promise<Session> {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const session: Session = {
      _id: token,
      userId,
      username,
      name,
      createdAt: new Date().toISOString(),
    };
    if (this.useMongo) return this.mongoDb!.insertOne<Session>("sessions", session);
    return this.jsonDb.insertOne<Session>("sessions", session);
  }

  async deleteSession(token: string): Promise<boolean> {
    if (this.useMongo) return this.mongoDb!.deleteOne("sessions", { _id: token });
    return this.jsonDb.deleteOne("sessions", { _id: token });
  }
}

// Beautiful sample pet records
const SEED_PETS: Omit<Pet, "_id" | "createdAt">[] = [
  {
    name: "Mochi (麻吉)",
    species: "dog",
    breed: "Golden Retriever (黃金獵犬)",
    age: "1 year old (1歲)",
    ageGroup: "young",
    gender: "male",
    size: "large",
    description: "Super friendly, energetic Golden Retriever who loves to fetch balls and swim! He is fully vaccinated, microchipped, and extremely gentle with kids and other pets.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
    contactInfo: {
      phone: "0912-345-678",
      email: "shelter-taipei@adoption.org",
      location: "Taipei City (台北市)"
    },
    listedBy: "admin",
    listedByName: "Taipei Pet Shelter"
  },
  {
    name: "Yuki (雪球)",
    species: "cat",
    breed: "British Shorthair (英短藍貓)",
    age: "6 months old (6個月)",
    ageGroup: "baby",
    gender: "female",
    size: "small",
    description: "Yuki is a sweet, calm British Shorthair kitten. She has beautiful amber eyes and a very soft plush blue coat. She enjoys curling up on laps and chasing laser pointers.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    contactInfo: {
      phone: "0923-456-789",
      email: "shelter-taichung@adoption.org",
      location: "Taichung City (台中市)"
    },
    listedBy: "admin",
    listedByName: "Taichung Cat Haven"
  },
  {
    name: "Coco (可可)",
    species: "dog",
    breed: "Toy Poodle (玩具紅貴賓)",
    age: "3 years old (3歲)",
    ageGroup: "adult",
    gender: "female",
    size: "small",
    description: "Coco is a clever, hypoallergenic Toy Poodle. She knows basic commands like sit, stay, and shake. She is quiet, sweet-tempered, and looking for a loving companion.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=600",
    contactInfo: {
      phone: "0934-567-890",
      email: "shelter-kaohsiung@adoption.org",
      location: "Kaohsiung City (高雄市)"
    },
    listedBy: "admin",
    listedByName: "Kaohsiung Animal Care"
  },
  {
    name: "Cookie (曲奇)",
    species: "cat",
    breed: "Ragdoll Mix (布偶混血)",
    age: "2 years old (2歲)",
    ageGroup: "adult",
    gender: "male",
    size: "medium",
    description: "Cookie is a gorgeous Ragdoll mix cat with stunning blue eyes. He has a very laid-back attitude and loves being held like a baby. He gets along great with dogs too!",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?auto=format&fit=crop&q=80&w=600",
    contactInfo: {
      phone: "0945-678-901",
      email: "shelter-hsinchu@adoption.org",
      location: "Hsinchu City (新竹市)"
    },
    listedBy: "admin",
    listedByName: "Hsinchu Love Animal Association"
  },
  {
    name: "Taro (芋頭)",
    species: "other",
    breed: "Holland Lop Rabbit (荷蘭垂耳兔)",
    age: "8 months old (8個月)",
    ageGroup: "young",
    gender: "male",
    size: "small",
    description: "Taro is a charming Holland Lop bunny with adorable floppy ears. He is potty-trained, loves eating fresh hay, and enjoys hopping around the room during playtime.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=600",
    contactInfo: {
      phone: "0956-789-012",
      email: "shelter-tainan@adoption.org",
      location: "Tainan City (台南市)"
    },
    listedBy: "admin",
    listedByName: "Tainan Bunny Friends"
  },
  {
    name: "Lucky (樂樂)",
    species: "dog",
    breed: "Shiba Inu (柴犬)",
    age: "4 years old (4歲)",
    ageGroup: "adult",
    gender: "male",
    size: "medium",
    description: "Lucky is a proud and loyal Shiba Inu who loves exploring trails. He is very clean, house-trained, and is incredibly loyal once he builds trust with his owner.",
    status: "available",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600",
    contactInfo: {
      phone: "0912-345-678",
      email: "shelter-taipei@adoption.org",
      location: "Taipei City (台北市)"
    },
    listedBy: "admin",
    listedByName: "Taipei Pet Shelter"
  }
];

export const db = new DatabaseManager();
