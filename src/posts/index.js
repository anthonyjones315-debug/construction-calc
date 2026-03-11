import roofPitch from './how-to-calculate-roof-pitch.js'
import concreteSlab from './how-to-calculate-concrete-for-a-slab.js'
import sprayFoam from './open-cell-vs-closed-cell-spray-foam.js'

export const POSTS = [roofPitch, concreteSlab, sprayFoam]

export function getPost(slug) {
  return POSTS.find(p => p.slug === slug) || null
}
