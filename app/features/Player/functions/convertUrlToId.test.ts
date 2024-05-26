import { describe, it, expect } from 'vitest';
import { convertUrlToId } from './convertUrlToId';

describe('convertUrlToId', () => {
  it('should return correct id for a valid YouTube URL', () => {
    const result = convertUrlToId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).toEqual({ platform: 'youtube', idOrUri: 'dQw4w9WgXcQ' });
  });

  it('should return correct id for a valid YouTube short URL', () => {
    const result = convertUrlToId('https://youtu.be/dQw4w9WgXcQ');
    expect(result).toEqual({ platform: 'youtube', idOrUri: 'dQw4w9WgXcQ' });
  });

  it('should return correct id for a valid Spotify URL', () => {
    const result = convertUrlToId('https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk');
    expect(result).toEqual({ platform: 'spotify', idOrUri: 'spotify:episode:4rOoJ6Egrf8K2IrywzwOMk' });
  });

  it('should return null for an invalid YouTube URL', () => {
    const result = convertUrlToId('https://www.youtube.com/watch?v=');
    expect(result).toEqual({ platform: null, idOrUri: null });
  });

  it('should return null for an invalid Spotify URL', () => {
    const result = convertUrlToId('https://open.spotify.com/episode/');
    expect(result).toEqual({ platform: null, idOrUri: null });
  });

  it('should return null for a non-YouTube and non-Spotify URL', () => {
    const result = convertUrlToId('https://example.com');
    expect(result).toEqual({ platform: null, idOrUri: null });
  });
});