import roofPitch from './how-to-calculate-roof-pitch.js'
import concreteSlab from './how-to-calculate-concrete-for-a-slab.js'
import sprayFoam from './open-cell-vs-closed-cell-spray-foam.js'
import wallStuds from './how-to-calculate-wall-studs.js'

export const POSTS = [roofPitch, concreteSlab, sprayFoam, wallStuds]

export function getPost(slug) {
  return POSTS.find(p => p.slug === slug) || null
}
