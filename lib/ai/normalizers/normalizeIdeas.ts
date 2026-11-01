import { CreativeIdea, CreativeIdeaCategory, CREATIVE_IDEA_CATEGORIES } from "../../types/event";
import { isOneOf } from "../../utils/guards";
import { asRecord, text, integer } from "../parsingHelpers";
import { VALID_IDEA_CATEGORIES_SET, IDEA_CATEGORY_MAP } from "../categoryMaps";

function resolveIdeaCategory(raw: unknown): CreativeIdeaCategory {
  const normalized = text(raw, "activities")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
  const candidate = VALID_IDEA_CATEGORIES_SET.has(normalized)
    ? normalized
    : (IDEA_CATEGORY_MAP[normalized] ?? "activities");
  return isOneOf(CREATIVE_IDEA_CATEGORIES, candidate) ? candidate : "activities";
}

export function normalizeIdeas(rawList: unknown[]): CreativeIdea[] {
  return rawList.map((value, index) => {
    const idea = asRecord(value) ?? {};
    const costRangeText =
      typeof idea.costRangeText === "string" && idea.costRangeText.trim()
        ? idea.costRangeText.trim()
        : undefined;

    return {
      id: text(idea.id, `ai-idea-${index + 1}`),
      category: resolveIdeaCategory(idea.category),
      title: text(idea.title, `Event idea ${index + 1}`),
      description: text(
        idea.description ?? idea.details,
        "A personalized suggestion for this event."
      ),
      whyItFits: text(
        idea.whyItFits ?? idea.rationale,
        "It supports the event's stated priorities."
      ),
      estimatedCostMinor: integer(idea.estimatedCostMinor ?? idea.costMinor ?? idea.cost, 0),
      costRangeText,
      implementationSteps: Array.isArray(idea.implementationSteps)
        ? idea.implementationSteps.filter((s): s is string => typeof s === "string")
        : [],
      constraints: Array.isArray(idea.constraints)
        ? idea.constraints.filter((c): c is string => typeof c === "string")
        : [],
      tradeOffs: Array.isArray(idea.tradeOffs)
        ? idea.tradeOffs.filter((t): t is string => typeof t === "string")
        : [],
      isSaved: false,
    };
  });
}
