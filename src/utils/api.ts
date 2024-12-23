import axios, {AxiosResponse} from "axios";
import {
    GIUIDLookup,
    HoyoCharacters,
    HoyosRecord,
    HSRUIDAPILookup,
    HSRUIDLookup,
    NoProfile,
    ProfileInfo
} from "../types/enka";

export async function get<T>(url: string) {
    return await axios.get<T>(url, { headers: { "User-Agent": "enka.discord" } });
}

export async function getBuffer(url: string) {
    return await axios.get(url, { responseType: "arraybuffer" }).then((response) => Buffer.from(response.data));
}

type LookupType<T extends 0 | 1> = T extends 0 ? GIUIDLookup : HSRUIDAPILookup | HSRUIDLookup;

type UIDExists<T extends 0 | 1> = T extends 0 ? GIUIDLookup : HSRUIDLookup;

class EnkaAPI {
    checkInvalid(profile: AxiosResponse<NoProfile | ProfileInfo | HoyosRecord | HoyoCharacters, any> | null) {
        return !profile || ('detail' in profile.data && profile.data.detail === "Not found.");
    }

    async profile(name: string) {
        const call = await get<ProfileInfo | NoProfile>(`https://enka.network/api/profile/${name}/?format=json`).catch(() => null);
        if(this.checkInvalid(call)) return null;
        return call;
    }

    async hoyos(name: string) {
        const call = await get<NoProfile | HoyosRecord>(`https://enka.network/api/profile/${name}/hoyos/?format=json`).catch(() => null);
        if(this.checkInvalid(call)) return null;
        return call;
    }

    async hoyosBuilds(name: string, hash: string) {
        const call = await get<NoProfile | HoyoCharacters>(`https://enka.network/api/profile/${name}/hoyos/${hash}/builds/?format=json`).catch(() => null);
        if(this.checkInvalid(call)) return null;
        return call;
    }

    async uid(uid: string, hoyo_type: 0 | 1): Promise<AxiosResponse<UIDExists<typeof hoyo_type>, any> | null> {
        const call = await get<LookupType<typeof hoyo_type>>(
            `https://enka.network/api/${hoyo_type === 0 ? "" : "hsr/"}uid/${uid}?format=json`
        ).catch(() => null);
        if(!call || ('detailInfo' in call.data && !('nickname' in call.data.detailInfo))) return null;
        return call as AxiosResponse<UIDExists<typeof hoyo_type>, any>;
    }
}

export const api = new EnkaAPI();

let giCharacters: {
    lastUpdated: number;
    characters: Characters[];
}

let hsrCharacters: {
    lastUpdated: number;
    characters: Characters[];
}

class GameCharacters {
    private async generateCharacters(hoyo_type: 0 | 1) {
        if(hoyo_type === 0) {
            giCharacters = {
                lastUpdated: Date.now(),
                characters: await getGICharacters()
            }
        } else {
            hsrCharacters = {
                lastUpdated: Date.now(),
                characters: await getHSRCharacters()
            }
        }
    }

    async getCharacters(hoyo_type: 0 | 1){
        if(hoyo_type === 0) {
            if(!giCharacters || Date.now() - giCharacters.lastUpdated > 1000 * 60 * 60) {
                await this.generateCharacters(0);
            }
            return giCharacters.characters;
        } else {
            if(!hsrCharacters || Date.now() - hsrCharacters.lastUpdated > 1000 * 60 * 60) {
                await this.generateCharacters(1);
            }
            return hsrCharacters.characters;
        }
    }

    async getCharacterById(hoyo_type: 0 | 1, id: string){
        const characters = await this.getCharacters(hoyo_type);
        return characters.find(character => character.characterId === id);
    }
}

export const characters = new GameCharacters();


type GICharactersAPI = Record<
    string,
    {
        [k: string]: unknown;
        NameTextMapHash: number;
        Element: string;
    }
>;

export type Characters = {
    name: string;
    characterId: string;
    nameHash: number;
    element: string;
};

export async function getGICharacters() {
    const locales = await getGILocales();
    const response = await axios.get(
        'https://raw.githubusercontent.com/EnkaNetwork/API-docs/refs/heads/master/store/characters.json',
    );
    const data: GICharactersAPI = response.data;
    const returndata: Characters[] = [];
    const localedata = locales['ru'];
    for (const [key, value] of Object.entries(data)) {
        const name = localedata[value.NameTextMapHash];
        returndata.push({
            name,
            characterId: key,
            nameHash: value.NameTextMapHash,
            element: value.Element,
        });
    }
    return returndata;
}

async function getGILocales(): Promise<Record<string, Record<string, string>>> {
    const response = await axios.get(
        'https://raw.githubusercontent.com/EnkaNetwork/API-docs/refs/heads/master/store/loc.json',
    );
    return response.data;
}

async function getHSRLocales(): Promise<
    Record<string, Record<string, string>>
> {
    const response = await axios.get(
        'https://raw.githubusercontent.com/EnkaNetwork/API-docs/refs/heads/master/store/hsr/hsr.json',
    );
    return response.data;
}

type HSRCharactersAPI = Record<
    string,
    {
        [k: string]: unknown;
        AvatarName: {
            Hash: number;
        };
        Element: string;
    }
>;

export async function getHSRCharacters() {
    const locales = await getHSRLocales();
    const response = await axios.get(
        'https://raw.githubusercontent.com/EnkaNetwork/API-docs/refs/heads/master/store/hsr/honker_characters.json',
    );
    const data: HSRCharactersAPI = response.data;
    const returndata: Characters[] = [];
    const localedata = locales['ru'];
    for (const [key, value] of Object.entries(data)) {
        const name = localedata[value.AvatarName.Hash];
        returndata.push({
            name,
            characterId: key,
            nameHash: value.AvatarName.Hash,
            element: value.Element,
        });
    }
    return returndata;
}