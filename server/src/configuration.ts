import * as fs from 'fs';

export enum StreamSourceType {
    sls = 'sls',
    rtmp = 'rtmp',
    belabox = 'belabox',
}

export interface StreamSource {
    type: StreamSourceType;
    name: string;
    url: string;
    key: string;
}

export interface TwitchConfig {
    appClientId: string;
    appClientSecret: string;
    tokenFile: string;
    channel: string;
}

export interface Rtirl {
    pullKey: string;
}

// FIXME: Validate against interfaces/definition?
export default () => {
    return JSON.parse(fs.readFileSync('config.json').toString());
};
