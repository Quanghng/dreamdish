-- CreateTable
CREATE TABLE "CookbookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "recipe" JSONB NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "originalIngredients" JSONB NOT NULL,
    "nutritionalInfo" JSONB,
    "drinkPairings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "rating" INTEGER,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    CONSTRAINT "CookbookEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
