import axios, { AxiosInstance } from 'axios'
import { inject } from '@adonisjs/fold'
import ConfigurationService from '#services/configuration.service'
import UnAuthorizedException from '#exceptions/un_authorized.exception'
import TechnicalException from '#exceptions/technical.exception'
import AuthProviders from '#models/auth_providers'
import User from '#models/user'
import { SpotifySearchTrackResponse } from './beans/spotify_search_track.response.js'

@inject()
export default class SpotifyService {
  private axiosInstance = this.buildAxiosInstance()

  constructor(private configurationService: ConfigurationService) {}

  private buildAxiosInstance(): AxiosInstance {
    const axiosInstance = axios.create({
      baseURL: this.configurationService.getSpotifyApiUrl(),
      timeout: 1000,
    })
    axiosInstance.interceptors.response.use(
      (response) => {
        // Any status code that lies within the range of 2xx causes this function to trigger
        return response
      },
      // TODO clean with adonis design pattern
      (error) => {
        if (error?.response?.status === 401) {
          throw new UnAuthorizedException()
        }
        throw new TechnicalException()
      }
    )
    return axiosInstance
  }

  private async getSpotifyAccessToken(userId: User['id']) {
    const social = await AuthProviders.query().where('user_id', userId).first()
    return social?.accessToken
  }

  // TODO utility ?
  async getArtists(userId: User['id']) {
    const accessToken = await this.getSpotifyAccessToken(userId)
    const resp = await this.axiosInstance.get('/me/top/artists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return resp?.data?.items
  }

  async getTracks(userId: User['id']): Promise<SpotifySearchTrackResponse['tracks']['items']> {
    const accessToken = await this.getSpotifyAccessToken(userId)
    const resp = await this.axiosInstance.get<SpotifySearchTrackResponse['tracks']>(
      '/me/top/tracks?time_range=medium_term&limit=5',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    return resp.data.items
  }

  async getTracksByIds(userId: User['id'], trackIds: string[]) {
    const commaSeparatedIds = trackIds.join(',')
    const accessToken = await this.getSpotifyAccessToken(userId)
    const resp = await this.axiosInstance.get(`/tracks?ids=${commaSeparatedIds}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return resp.data.tracks
  }

  async getTracksByName(
    userId: User['id'],
    name: string
  ): Promise<SpotifySearchTrackResponse['tracks']['items']> {
    const accessToken = await this.getSpotifyAccessToken(userId)
    const resp = await this.axiosInstance.get<SpotifySearchTrackResponse>(
      `/search?q=track:${name}&type=track`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    return resp.data.tracks.items
  }
}
