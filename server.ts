import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.js"; // Note: esbuild + Node.js supports resolution

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Helper to extract authenticated user from custom header ---
  const getAuthUser = async (req: express.Request) => {
    const token = req.headers["x-session-token"] as string;
    if (!token) return null;
    return await db.getSession(token);
  };

  // --- Authentication Endpoints ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name, email } = req.body;
      if (!username || !password || !name || !email) {
        return res.status(400).json({ error: "All fields are required (所有欄位皆為必填)" });
      }

      // Check if user already exists
      const existingUser = await db.getUser({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists (使用者名稱已存在)" });
      }

      const existingEmail = await db.getUser({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered (此電子郵件已註冊)" });
      }

      // Simplified hashing for this environment
      const passwordHash = `hash_${password}`;
      
      const avatarList = [
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Buddy",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Coco",
        "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna"
      ];
      const avatar = avatarList[Math.floor(Math.random() * avatarList.length)];

      const newUser = await db.createUser({
        username,
        passwordHash,
        name,
        email,
        avatar
      });

      const session = await db.createSession(newUser._id, newUser.username, newUser.name);
      res.status(201).json({
        token: session._id,
        user: {
          _id: newUser._id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await db.getUser({ username });
      if (!user || user.passwordHash !== `hash_${password}`) {
        return res.status(401).json({ error: "Invalid username or password (密碼或帳號錯誤)" });
      }

      const session = await db.createSession(user._id, user.username, user.name);
      res.json({
        token: session._id,
        user: {
          _id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const token = req.headers["x-session-token"] as string;
      if (token) {
        await db.deleteSession(token);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await db.getUser({ _id: session.userId });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // --- Pets Endpoints ---
  app.get("/api/pets", async (req, res) => {
    try {
      const pets = await db.getPets();
      
      // Perform manual filtering based on query parameters
      const { species, ageGroup, size, gender, search } = req.query;
      let filtered = pets;

      if (species && species !== "all") {
        filtered = filtered.filter(p => p.species === species);
      }
      if (ageGroup && ageGroup !== "all") {
        filtered = filtered.filter(p => p.ageGroup === ageGroup);
      }
      if (size && size !== "all") {
        filtered = filtered.filter(p => p.size === size);
      }
      if (gender && gender !== "all") {
        filtered = filtered.filter(p => p.gender === gender);
      }
      if (search) {
        const term = String(search).toLowerCase();
        filtered = filtered.filter(
          p => p.name.toLowerCase().includes(term) || 
               p.breed.toLowerCase().includes(term) || 
               p.description.toLowerCase().includes(term)
        );
      }

      res.json(filtered);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/pets/:id", async (req, res) => {
    try {
      const pet = await db.getPet({ _id: req.params.id });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }
      res.json(pet);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/pets", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required to list a pet (需要登入以刊登寵物)" });
      }

      const { name, species, breed, age, ageGroup, gender, size, description, imageUrl, contactInfo } = req.body;
      if (!name || !species || !breed || !age || !ageGroup || !gender || !size || !description || !contactInfo?.phone || !contactInfo?.email || !contactInfo?.location) {
        return res.status(400).json({ error: "Please provide all required details (請填寫完整的寵物資料)" });
      }

      const fallbackImages = {
        dog: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
        cat: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600",
        other: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=600"
      };

      const finalImageUrl = imageUrl || fallbackImages[species as "dog" | "cat" | "other"];

      const newPet = await db.createPet({
        name,
        species,
        breed,
        age,
        ageGroup,
        gender,
        size,
        description,
        status: "available",
        imageUrl: finalImageUrl,
        contactInfo,
        listedBy: session.userId,
        listedByName: session.name
      });

      res.status(201).json(newPet);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/pets/:id", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const pet = await db.getPet({ _id: req.params.id });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      // Allow updates if the user listed it, OR if user is admin
      if (pet.listedBy !== session.userId && session.userId !== "admin") {
        return res.status(403).json({ error: "Unauthorized to update this pet profile (您沒有權限修改此寵物資料)" });
      }

      const { name, breed, age, ageGroup, gender, size, description, status, imageUrl, contactInfo } = req.body;
      const updatePayload: any = {};
      if (name !== undefined) updatePayload.name = name;
      if (breed !== undefined) updatePayload.breed = breed;
      if (age !== undefined) updatePayload.age = age;
      if (ageGroup !== undefined) updatePayload.ageGroup = ageGroup;
      if (gender !== undefined) updatePayload.gender = gender;
      if (size !== undefined) updatePayload.size = size;
      if (description !== undefined) updatePayload.description = description;
      if (status !== undefined) updatePayload.status = status;
      if (imageUrl !== undefined) updatePayload.imageUrl = imageUrl;
      if (contactInfo !== undefined) updatePayload.contactInfo = contactInfo;

      const success = await db.updatePet(req.params.id, updatePayload);
      if (!success) {
        return res.status(500).json({ error: "Failed to update pet profile" });
      }

      res.json({ success: true, message: "Pet updated successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/pets/:id", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const pet = await db.getPet({ _id: req.params.id });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      if (pet.listedBy !== session.userId && session.userId !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const success = await db.deletePet(req.params.id);
      res.json({ success });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // --- Adoption Requests Endpoints ---
  app.post("/api/requests", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required to request adoption (請先登入以發送認養申請)" });
      }

      const { petId, message, phone, email, name } = req.body;
      if (!petId || !message || !phone || !email || !name) {
        return res.status(400).json({ error: "All fields are required (所有欄位皆為必填)" });
      }

      const pet = await db.getPet({ _id: petId });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      if (pet.listedBy === session.userId) {
        return res.status(400).json({ error: "You cannot request to adopt your own listed pet (您無法認養自己刊登的寵物)" });
      }

      // Check if duplicate pending request exists
      const existingReqs = await db.getRequests({ petId, requesterId: session.userId });
      const hasPending = existingReqs.some(r => r.status === "pending");
      if (hasPending) {
        return res.status(400).json({ error: "You already have a pending adoption request for this pet (您已對此寵物送出過認養申請，目前審核中)" });
      }

      const request = await db.createRequest({
        petId,
        petName: pet.name,
        petImageUrl: pet.imageUrl,
        requesterId: session.userId,
        requesterName: name,
        requesterEmail: email,
        requesterPhone: phone,
        message,
        status: "pending"
      });

      res.status(201).json(request);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/requests", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Fetch all requests
      const allRequests = await db.getRequests();

      // Filter requests:
      // 1. Sent by the current user
      // 2. Received for pets listed by the current user
      const userSent = allRequests.filter(r => r.requesterId === session.userId);

      // To find received requests, get all pets listed by the current user
      const myPets = await db.getPets();
      const myPetIds = myPets.filter(p => p.listedBy === session.userId).map(p => p._id);
      const userReceived = allRequests.filter(r => myPetIds.includes(r.petId));

      res.json({
        sent: userSent,
        received: userReceived
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/requests/:id", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      // Find request
      const allRequests = await db.getRequests();
      const request = allRequests.find(r => r._id === req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Adoption request not found" });
      }

      // Ensure the user is the owner of the pet listed
      const pet = await db.getPet({ _id: request.petId });
      if (!pet) {
        return res.status(404).json({ error: "Associated pet not found" });
      }

      if (pet.listedBy !== session.userId && session.userId !== "admin") {
        return res.status(403).json({ error: "Unauthorized to update this request (您非該寵物刊登者，無權處理此認養申請)" });
      }

      // Update the request status
      await db.updateRequest(req.params.id, { status });

      // If approved, update pet status to adopted (or pending/adopted)
      if (status === "approved") {
        await db.updatePet(request.petId, { status: "adopted" });
        // Optionally reject all other pending requests for this pet
        const otherReqs = allRequests.filter(r => r.petId === request.petId && r._id !== request._id && r.status === "pending");
        for (const req of otherReqs) {
          await db.updateRequest(req._id, { status: "rejected" });
        }
      } else if (status === "rejected") {
        // If the pet was pending/adopted, set it back to available if no other approvals
        const hasOtherApproved = allRequests.some(r => r.petId === request.petId && r._id !== request._id && r.status === "approved");
        if (!hasOtherApproved) {
          await db.updatePet(request.petId, { status: "available" });
        }
      }

      res.json({ success: true, status });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // --- Favorites Endpoints ---
  app.get("/api/favorites", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const favorites = await db.getFavorites({ userId: session.userId });
      res.json(favorites);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const session = await getAuthUser(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required to favorite (請先登入以收藏寵物)" });
      }

      const { petId } = req.body;
      if (!petId) {
        return res.status(400).json({ error: "petId is required" });
      }

      const existingFav = await db.getFavorites({ userId: session.userId, petId });
      if (existingFav.length > 0) {
        // Already favorited, so delete it (toggle behavior)
        await db.removeFavorite(session.userId, petId);
        return res.json({ favorited: false });
      }

      await db.addFavorite({ userId: session.userId, petId });
      res.json({ favorited: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });


  // --- UI & Client Serving Middleware (Vite Integration) ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
