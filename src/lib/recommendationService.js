import { prisma } from "../prisma/index.js";

const RECOMMENDATIONS = 3;
const SIMILARITY_THRESHOLD = 0.55;

export const getUserRecommendations = async (userId) => {
  userId = parseInt(userId);

  const preferenceBasedProperties =
    await getPreferenceBasedRecommendations(userId);

  const interactionMatrix = await getUserPropertyInteractionMatrix();

  const collaborativeProperties = await recommendProperties(
    userId,
    interactionMatrix,
  );

  const combinedProperties = mergeRecommendations(
    preferenceBasedProperties,
    collaborativeProperties,
  );
  return combinedProperties;
};

//based on user interactions
export const getPreferenceBasedRecommendations = async (userId) => {
  const userInteractions = await prisma.interaction.findMany({
    where: { userId },
    include: { property: true },
  });

  const interactedPropertyIds = new Set(
    userInteractions.map((i) => i.property.id),
  );

  const uniqueProperties = Array.from(
    new Map(userInteractions.map((i) => [i.property.id, i.property])).values(),
  );

  const userPreferences = {
    totalRent: getAverage(uniqueProperties.map((p) => p.totalRent)),
    numberOfRooms: getAverage(uniqueProperties.map((p) => p.numberOfRooms)),
    livingSpaceSqm: getAverage(uniqueProperties.map((p) => p.livingSpaceSqm)),
    pets: getPreferredValue(uniqueProperties, "pets"),
    smoking: getPreferredValue(uniqueProperties, "smoking"),
    furnished: getPreferredValue(uniqueProperties, "furnished"),
  };

  let recommendedProperties = await prisma.property.findMany({
    where: {
      status: "ACTIVE",
      id: { notIn: Array.from(interactedPropertyIds) },
      totalRent: {
        lte: userPreferences.totalRent * 1.15,
        gte: userPreferences.totalRent * 0.85,
      },
      numberOfRooms: userPreferences.numberOfRooms,
      livingSpaceSqm: {
        lte: userPreferences.livingSpaceSqm * 1.2,
        gte: userPreferences.livingSpaceSqm * 0.8,
      },
      pets: userPreferences.pets,
      smoking: userPreferences.smoking,
      furnished: userPreferences.furnished,
      availableFrom: { gte: new Date() },
    },
    include: { media: true },
    omit: { creatorComment: true, adminComment: true },
  });

  // no properties are found, relax price filters
  if (recommendedProperties.length === 0) {
    recommendedProperties = await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        id: { notIn: Array.from(interactedPropertyIds) },
        totalRent: {
          lte: userPreferences.totalRent * 1.2,
          gte: userPreferences.totalRent * 0.75,
        },
        numberOfRooms: userPreferences.numberOfRooms,
      },
      include: { media: true },
      omit: { creatorComment: true, adminComment: true },
    });
  }
  return recommendedProperties;
};

export const getUserPropertyInteractionMatrix = async () => {
  const interactions = await prisma.interaction.findMany({
    include: {
      user: true,
      property: true,
    },
  });

  const interactionMatrix = {};
  interactions.forEach((interaction) => {
    const { userId, propertyId } = interaction;
    if (!interactionMatrix[userId]) {
      interactionMatrix[userId] = {};
    }
    interactionMatrix[userId][propertyId] = 1;
  });

  return interactionMatrix;
};

function cosineSimilarity(userA, userB, interactionMatrix) {
  const propertiesA = interactionMatrix[userA];
  const propertiesB = interactionMatrix[userB];

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let propertyId in propertiesA) {
    if (propertiesB[propertyId]) {
      dotProduct += propertiesA[propertyId] * propertiesB[propertyId];
    }
    normA += Math.pow(propertiesA[propertyId], 2);
  }
  for (let propertyId in propertiesB) {
    normB += Math.pow(propertiesB[propertyId], 2);
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

//based on similar users
export const recommendProperties = async (userId, interactionMatrix) => {
  const similarities = {};

  const propertyExplanations = {};

  for (let otherUserId in interactionMatrix) {
    if (parseInt(otherUserId) !== userId) {
      similarities[otherUserId] = cosineSimilarity(
        userId,
        otherUserId,
        interactionMatrix,
      );
    }
  }

  const sortedSimilarUsers = Object.entries(similarities).sort(
    (a, b) => b[1] - a[1],
  );

  const recommendedProperties = new Set();
  let maxSimilarityUser = null;
  let maxSimilarityScore = 0;

  for (let [otherUserId, similarity] of sortedSimilarUsers) {
    if (similarity > SIMILARITY_THRESHOLD) {
      const properties = interactionMatrix[otherUserId];
      for (let propertyId in properties) {
        if (!interactionMatrix[userId]?.[propertyId]) {
          recommendedProperties.add(parseInt(propertyId));
          //explanation
          if (!propertyExplanations[propertyId]) {
            propertyExplanations[propertyId] = {
              reasons: [`Liked by users similar to you.`],
            };
          }
        }
      }
    }
    if (similarity > maxSimilarityScore) {
      maxSimilarityScore = similarity;
      maxSimilarityUser = otherUserId;
    }
  }
  //when no user matching threshold, use next most similar user
  if (recommendedProperties.size === 0 && maxSimilarityUser) {
    const remainingProperties = interactionMatrix[maxSimilarityUser];
    for (let propertyId in remainingProperties) {
      if (!interactionMatrix[userId]?.[propertyId]) {
        recommendedProperties.add(parseInt(propertyId));
        //explanation
        if (!propertyExplanations[propertyId]) {
          propertyExplanations[propertyId] = {
            reasons: [`Liked by users similar to you.`],
          };
        }
      }
    }
  }

  const properties = await prisma.property.findMany({
    where: { status: "ACTIVE", id: { in: Array.from(recommendedProperties) } },
    include: { media: true },
    omit: { creatorComment: true, adminComment: true },
  });

  return properties.map((property) => {
    return {
      ...property,
      explanation: propertyExplanations[property.id] || { reasons: [] },
    };
  });
};

function mergeRecommendations(preferenceProperties, collaborativeProperties) {
  const combined = new Map();

  preferenceProperties.forEach((property) => {
    combined.set(property.id, {
      id: property.id,
      propertyId: property.id,
      property,
      score: 1,
      explanation: {
        reasons: [`Matches your preferences.`],
      },
    });
  });

  collaborativeProperties.forEach((property) => {
    if (combined.has(property.id)) {
      combined.get(property.id).score += 1.5; //prioritize the ones present in both lists
    } else {
      combined.set(property.id, {
        id: property.id,
        propertyId: property.id,
        property,
        score: 1,
        explanation: {
          reasons: [`Liked by users with similar interests.`],
        },
      });
    }
  });

  return Array.from(combined.entries())
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, RECOMMENDATIONS) // Top 3
    .map(([id, { explanation }]) => ({
      id,
      reasons: explanation.reasons,
    }));
}

//utility functions
function getAverage(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function getPreferredValue(properties, key) {
  const preferenceCount = properties.filter((p) => p[key]).length;
  return preferenceCount > properties.length / 2;
}
