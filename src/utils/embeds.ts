import {AttachmentBuilder, ColorResolvable, EmbedBuilder as BaseEmbedBuilder} from "discord.js";
import {getBuffer, getCharacter} from "./misc";
import {DjBuild} from "../types/models";

export class EmbedBuilder extends BaseEmbedBuilder {
    constructor() {
        super();
        this.setColor("#fc9c88")
    }
}

export function connectAccountEmbed(username: string, code: string) {
    return new EmbedBuilder()
        .setTitle("Подключите свою учетную запись")
        .setDescription(`Чтобы подключить свою учетную запись Discord к ${username}, пожалуйста, вставьте следующий код в описание в ([настройках](https://enka.network/profile/settings/)): \`${code}\`

После того как ввели код, нажмите кнопку \`Подвердить\` ниже.
Для отмены нажмите кнопку \`Отмена\`.`)
        .setFooter({ text: "Этот код истекает через 5 минут" })
}

export function generateBuildEmbed(name: string, color?: ColorResolvable) {
    return (!color ? new EmbedBuilder() : new EmbedBuilder().setColor(color))
        .setTitle(`Выберите сборку`)
        .setDescription("В меню выбора ниже выберите сборки, которые хотите просмотреть.")
        .setFooter({ text: name })
}

export function generateUidBuildEmbed(uid: string, color?: ColorResolvable) {
    return (!color ? new EmbedBuilder() : new EmbedBuilder().setColor(color))
        .setTitle("Выберите игру")
        .setDescription("В меню выбора ниже выберите игру, к которой относится этот UID, и сборку, которую вы хотите просмотреть.")
        .setFooter({ text: uid })
}

export async function generateCardEmbed(name: string, hash: string, build: DjBuild): Promise<[EmbedBuilder, AttachmentBuilder]> {
    const card = await getBuffer(`https://cards.enka.network/u/${name}/${hash}/${build.avatar_id}/${build.id}/image?lang=ru`)
    const imgName = `${name}-${hash}-${build.avatar_id}-${build.id}.png`;

    const attachment = new AttachmentBuilder(card, { name: imgName })

    const character = getCharacter(build.hoyo_type, build.avatar_id)

    return [new EmbedBuilder()
        .setTitle(`Сборка: ${build.name || "Сборка с витрины"}`)
        .setImage(`attachment://${imgName}`)
        .setFooter({ text: name })
        .setColor(character.colorFromElement), attachment]
}