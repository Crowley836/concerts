import { normalizeArtistName } from '../../src/utils/normalize.js'
import * as dotenv from 'dotenv'

dotenv.config()

export interface SpotifyArtist {
    id: string
    name: string
    images: { url: string; height: number; width: number }[]
    genres: string[]
    popularity: number
    external_urls: { spotify: string }
}

export class SpotifyClient {
    private accessToken: string | null = null
    private clientId: string
    private clientSecret: string

    constructor(clientId?: string, clientSecret?: string) {
        this.clientId = clientId || process.env.SPOTIFY_CLIENT_ID || ''
        this.clientSecret = clientSecret || process.env.SPOTIFY_CLIENT_SECRET || ''
    }

    get isConfigured(): boolean {
        return !!this.clientId && !!this.clientSecret
    }

    /**
     * Get Spotify access token using Client Credentials flow
     */
    private async getAccessToken(): Promise<string> {
        if (this.accessToken) return this.accessToken

        if (!this.isConfigured) {
            throw new Error('Missing Spotify credentials')
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        })

        if (!response.ok) {
            throw new Error(`Spotify auth failed: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        this.accessToken = data.access_token
        return this.accessToken!
    }

    /**
     * Search for artist on Spotify
     */
    async searchArtist(artistName: string): Promise<SpotifyArtist | null> {
        try {
            const token = await this.getAccessToken()
            const encodedName = encodeURIComponent(artistName)
            const url = `https://api.spotify.com/v1/search?type=artist&q=${encodedName}&limit=5`

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) return null

            const data = await response.json()
            const artists = data.artists?.items || []

            if (artists.length === 0) return null

            // Return top result if it matches reasonably well
            const topResult = artists[0]
            if (this.fuzzyMatch(artistName, topResult.name)) {
                return topResult
            }

            return null
        } catch (error) {
            console.error('Spotify search error:', error)
            return null
        }
    }

    /**
     * Fetch artist's most popular album
     */
    async getArtistTopAlbum(artistId: string): Promise<any | null> {
        try {
            const token = await this.getAccessToken()
            const url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&market=US&limit=20`

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) return null

            const data = await response.json()
            const albums = data.items || []

            if (albums.length === 0) return null

            // Get full details for popularity sort
            // Only fetch top 5 to save rate limits
            const albumDetailsPromises = albums.slice(0, 5).map(async (album: any) => {
                const detailUrl = `https://api.spotify.com/v1/albums/${album.id}`
                const detailRes = await fetch(detailUrl, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                return detailRes.ok ? detailRes.json() : null
            })

            const albumDetails = (await Promise.all(albumDetailsPromises)).filter(Boolean)
            albumDetails.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))

            return albumDetails[0] || null
        } catch (error) {
            console.error('Spotify album fetch error:', error)
            return null
        }
    }

    /**
     * Fetch top tracks
     */
    async getArtistTopTracks(artistId: string): Promise<any[]> {
        try {
            const token = await this.getAccessToken()
            const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!response.ok) return []

            const data = await response.json()
            return data.tracks?.slice(0, 3) || []
        } catch (error) {
            console.error('Spotify tracks fetch error:', error)
            return []
        }
    }

    private fuzzyMatch(input: string, result: string): boolean {
        const normalize = (s: string) =>
            s.toLowerCase().replace(/[^a-z0-9]/g, '').trim()

        const normalizedInput = normalize(input)
        const normalizedResult = normalize(result)

        return normalizedResult.includes(normalizedInput) || normalizedInput.includes(normalizedResult)
    }
}
