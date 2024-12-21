import {ColorResolvable, EmbedBuilder} from "discord.js";
import {ProfileInfo} from "../types/enka";

export function Embed() {
    return new EmbedBuilder().setColor("#fc9c88")
}

export function connectAccountEmbed(profile: ProfileInfo, code: string) {
    return Embed()
        .setTitle("Привязать аккаунт Discord")
        .setDescription(`Чтобы привзать свой аккаунт Discord к ${profile.username}, пожалуйста, включите следующий код в описание в ([настройках](https://enka.network/profile/settings/)): \`${code}\`

После того как ввели код, нажмите кнопку \`Подвердить\` ниже.
Для отмены нажмите кнопку \`Отмена\`.`)
        .setFooter({ text: "This code will expire in 5 minutes" })
}

export function generateBuildEmbed(name: string, color?: ColorResolvable) {
    return (!color ? Embed() : new EmbedBuilder().setColor(color))
        .setTitle(`Выберите сборку`)
        .setDescription("В меню выбора ниже выберите сборки, которые хотите просмотреть.")
        .setFooter({ text: `Аккаунт: ${name}`})
}

export function generateUidBuildEmbed(uid: string, color?: ColorResolvable) {
    return (!color ? Embed() : new EmbedBuilder().setColor(color))
        .setTitle("Выберите игру")
        .setDescription("В меню выбора ниже выберите игру, к которой относится этот UID, и сборку, которую вы хотите просмотреть.")
        .setFooter({ text: `UID: ${uid}`})
}