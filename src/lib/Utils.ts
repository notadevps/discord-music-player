const error = (error: string) => {
    throw new Error(error);
}

export type Null<T> = T | null

export default  error;

export interface  filters  {
    bassboost?: string,
    '8D'?: string,
    vaporwave?: string,
    nightcore?: string,
    phaser?: string,
    tremolo?: string,
    vibrato?: string,
    reverse?: string,
    treble?: string,
    normalizer?: string,
    surrounding?: string,
    pulsator?: string,
    subboost?: string,
    karaoke?: string,
    flanger?: string,
    gate?: string,
    haas?: string,
    mcompand?: string,
    mono?: string
}

export interface options { 
    autoSelfDeaf?: boolean;
}