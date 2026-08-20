import { Router } from 'express';
import { db } from '../database/db';

export const simulationRouter = Router();

// Run what-if scenario simulation
// Matches the frontend's RailwayApi.evaluateWhatIf() call at POST /api/simulation/what-if
simulationRouter.post('/what-if', (req, res) => {
  const { trainNumber, delayMinutes, section, action } = req.body;
  const train = db.getTrainByNumber(trainNumber || '12951');

  const baselineDelay = Math.round((delayMinutes || 15) * 2.5);
  const aiOptimizedDelay = Math.round((delayMinutes || 15) * 0.8);
  const conflictProbability = delayMinutes > 20 ? 85 : 45;

  return res.json({
    success: true,
    simulation: {
      scenario: `Delay +${delayMinutes}m on Train ${trainNumber || '12951'} (${train?.name || 'Mumbai Rajdhani'})`,
      section: section || 'NDLS-CNB Main Line',
      timestamp: new Date().toISOString(),
      baseline: {
        totalNetworkDelayMinutes: baselineDelay,
        cascadingTrainsAffected: Math.floor(baselineDelay / 6),
        conflictProbabilityPercent: conflictProbability,
        sectionThroughputPercent: 74
      },
      aiOptimized: {
        totalNetworkDelayMinutes: aiOptimizedDelay,
        cascadingTrainsAffected: 1,
        conflictProbabilityPercent: 5,
        sectionThroughputPercent: 91,
        savedDelayMinutes: baselineDelay - aiOptimizedDelay
      },
      recommendedStrategy: [
        `Reallocate Train ${trainNumber || '12951'} to Loop Line 2 at Aligarh Junction`,
        `Grant immediate clearance to trailing Vande Bharat 22436 on Down Fast Line`,
        `Adjust departure slot at Kanpur Central by +4 mins to avoid platform occupancy clash`
      ]
    }
  });
});
