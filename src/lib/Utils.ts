const error = (error: string) => {
    throw new Error(error);
}

export type Null<T> = T | null

export default  error;

export interface  filters  {
    bassboost?: boolean,
    '8D'?: boolean,
    vaporwave?: boolean,
    nightcore?: boolean,
    phaser?: boolean,
    tremolo?: boolean,
    vibrato?: boolean,
    reverse?: boolean;
    treble?: boolean;
    normalizer?: boolean;
    surrounding?: boolean;
    pulsator?: boolean;
    subboost?: boolean;
    karaoke?: boolean;
    flanger?: boolean;
    gate?: boolean;
    haas?: boolean;
    mcompand?: boolean;
    mono?: boolean;
}


export interface options { 
    autoSelfDeaf?: boolean;
}