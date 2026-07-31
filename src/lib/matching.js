import stringSimilarity from 'string-similarity';

export const SYNONYMS = {
  phone: ["mobile", "cell", "smartphone"],
  bag: ["backpack", "sack", "rucksack"],
  id: ["card", "identity card", "id card"],
  wallet: ["purse"],
  laptop: ["notebook", "macbook"],
  charger: ["cable", "adapter"],
  bottle: ["flask"],
  umbrella: ["rain cover"]
};

/**
 * Synchronously score candidate reports against target report.
 * @param {Object} newReport - The newly submitted report object
 * @param {Array} candidateReports - Existing opposite-type reports
 * @returns {Array} Array of { report, score } sorted by score descending, score >= 50
 */
export function calculateMatches(newReport, candidateReports = []) {
  if (!newReport || !Array.isArray(candidateReports)) return [];

  // Opposite type filter: if new is 'lost', compare against 'found' and vice versa
  const oppositeType = newReport.report_type === 'lost' ? 'found' : 'lost';
  const filteredCandidates = candidateReports.filter(c => c.report_type === oppositeType && c.id !== newReport.id);

  const getCombinedText = (item) => {
    const desc = item.description || '';
    const tags = Array.isArray(item.ai_tags) ? item.ai_tags.join(' ') : (item.ai_tags || '');
    const name = item.item_name || '';
    return `${name} ${desc} ${tags}`.toLowerCase();
  };

  const textA = getCombinedText(newReport);

  const results = filteredCandidates.map(candidate => {
    let score = 0;

    // 1. Category match (+40 pts)
    if (newReport.category && candidate.category && newReport.category.toLowerCase() === candidate.category.toLowerCase()) {
      score += 40;
    }

    // 2. String similarity between combined description + ai_tags (+30 pts scaled)
    const textB = getCombinedText(candidate);
    const sim = stringSimilarity.compareTwoStrings(textA, textB);
    score += Math.round(sim * 30);

    // 3. Synonym matching (+10 pts)
    let synonymMatched = false;
    for (const [key, list] of Object.entries(SYNONYMS)) {
      const allVariants = [key, ...list];
      const matchInA = allVariants.some(term => textA.includes(term));
      const matchInB = allVariants.some(term => textB.includes(term));
      if (matchInA && matchInB) {
        synonymMatched = true;
        break;
      }
    }
    if (synonymMatched) {
      score += 10;
    }

    // 4. Location zone match (+20 pts)
    if (newReport.location_zone && candidate.location_zone && newReport.location_zone.toLowerCase() === candidate.location_zone.toLowerCase()) {
      score += 20;
    }

    return {
      report: candidate,
      score: Math.min(100, score)
    };
  });

  // Filter for score >= 50 and sort descending
  return results
    .filter(res => res.score >= 50)
    .sort((a, b) => b.score - a.score);
}
