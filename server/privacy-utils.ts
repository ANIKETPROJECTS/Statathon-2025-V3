/**
 * Privacy Enhancement Utilities
 * Implements L-Diversity and T-Closeness for sensitive attribute protection
 */

export interface EquivalenceClassInfo {
  key: string;
  records: any[];
  size: number;
  distinctCount: number;
}

/**
 * L-DIVERSITY: Distinct Variant
 * Ensures each equivalence class contains at least l distinct values
 * for the sensitive attribute
 */
export function applyLDiversityDistinct(
  data: any[],
  quasiIdentifiers: string[],
  sensitiveAttribute: string,
  lValue: number
): { processedData: any[]; recordsSuppressed: number; informationLoss: number } {
  // Build equivalence classes
  const ecMap = new Map<string, EquivalenceClassInfo>();

  const sensitiveValuesByKey = new Map<string, Set<string>>();

  data.forEach((row) => {
    const key = quasiIdentifiers.map((qi) => String(row[qi] || "")).join("|");
    if (!ecMap.has(key)) {
      ecMap.set(key, { key, records: [], size: 0, distinctCount: 0 });
      sensitiveValuesByKey.set(key, new Set());
    }
    const ec = ecMap.get(key)!;
    ec.records.push(row);
    ec.size++;
    sensitiveValuesByKey.get(key)!.add(String(row[sensitiveAttribute] || ""));
  });

  // Count distinct values in each equivalence class
  const equivalenceClasses = Array.from(ecMap.values()).map((ec) => ({
    ...ec,
    distinctCount: sensitiveValuesByKey.get(ec.key)!.size,
  }));

  let processedData: any[] = [];
  let recordsSuppressed = 0;

  equivalenceClasses.forEach((ec) => {
    if (ec.distinctCount >= lValue) {
      // Group is l-diverse, keep all records
      processedData.push(...ec.records);
    } else {
      // Group violates l-diversity, suppress
      recordsSuppressed += ec.size;
    }
  });

  const informationLoss = recordsSuppressed / data.length;

  return { processedData, recordsSuppressed, informationLoss };
}

/**
 * T-CLOSENESS: Earth Mover's Distance (EMD) Implementation
 * Ensures sensitive attribute distribution within groups stays close
 * to overall distribution (measured by EMD)
 */
export function applyTCloseness(
  data: any[],
  quasiIdentifiers: string[],
  sensitiveAttribute: string,
  tValue: number
): { processedData: any[]; recordsSuppressed: number; informationLoss: number } {
  // Build equivalence classes
  const ecMap = new Map<string, EquivalenceClassInfo>();

  data.forEach((row) => {
    const key = quasiIdentifiers.map((qi) => String(row[qi] || "")).join("|");
    if (!ecMap.has(key)) {
      ecMap.set(key, {
        key,
        records: [],
        size: 0,
        distinctCount: 0,
      });
    }
    const ec = ecMap.get(key)!;
    ec.records.push(row);
    ec.size++;
  });

  // Calculate overall distribution
  const valueFrequency = new Map<string, number>();
  data.forEach((row) => {
    const val = String(row[sensitiveAttribute] || "");
    valueFrequency.set(val, (valueFrequency.get(val) || 0) + 1);
  });

  // Overall distribution
  const overallDist = new Map<string, number>();
  valueFrequency.forEach((count, val) => {
    overallDist.set(val, count / data.length);
  });

  let processedData: any[] = [];
  let recordsSuppressed = 0;

  // Check t-closeness for each equivalence class
  Array.from(ecMap.values()).forEach((ec) => {
    // Calculate distribution within group
    const groupValueFrequency = new Map<string, number>();
    ec.records.forEach((row) => {
      const val = String(row[sensitiveAttribute] || "");
      groupValueFrequency.set(val, (groupValueFrequency.get(val) || 0) + 1);
    });

    const groupDist = new Map<string, number>();
    groupValueFrequency.forEach((count, val) => {
      groupDist.set(val, count / ec.size);
    });

    // Calculate EMD (simplified: L1 distance)
    let emd = 0;
    const allValues = new Set<string>();
    
    overallDist.forEach((_, val) => allValues.add(val));
    groupDist.forEach((_, val) => allValues.add(val));

    allValues.forEach((val) => {
      const overallProb = overallDist.get(val) || 0;
      const groupProb = groupDist.get(val) || 0;
      emd += Math.abs(overallProb - groupProb);
    });

    emd = emd / 2; // L1 distance is half the sum of absolute differences

    if (emd <= tValue) {
      // Group satisfies t-closeness
      processedData.push(...ec.records);
    } else {
      // Group violates t-closeness, suppress
      recordsSuppressed += ec.size;
    }
  });

  const informationLoss = recordsSuppressed / data.length;

  return { processedData, recordsSuppressed, informationLoss };
}

/**
 * Helper: Calculate information loss
 * Measures how much data utility is lost during anonymization
 */
export function calculateInformationLoss(
  originalSize: number,
  processedSize: number,
  suppressedRecords: number
): number {
  return Math.max(0, suppressedRecords / originalSize);
}
