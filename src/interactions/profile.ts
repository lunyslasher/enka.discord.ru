import { Command } from "../types/discord";
import {db} from "../utils/db";
import {eq} from "drizzle-orm";
import {users} from "../schema";
import {api, get} from "../utils/api";
import {NoProfile, ProfileInfo} from "../types/enka";
import {Embed} from "../utils/embeds";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default {
    name: "profile",
    role: "CHAT_INPUT",
    description: "Проверьте свой собственный профиль или чужой профиль",
    options: [
        {
            type: 3,
            name: "name",
            description: "Имя учетной записи, профиль которой вы хотите получить",
            required: false,
        },
    ],
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) =>  {
        const user = interaction.options.getString("name") || await db.query.users.findFirst({ where: eq(users.id, interaction.user.id) }).then(user => user?.enka_name);
        if (!user) {
            await interaction.reply({ content: "Пользователь не найден. Подключите свою учетную запись или проверьте введенное имя учетной записи.", ephemeral: true });
            return;
        }

        const apiProfile = await api.profile(user);

        if (!apiProfile) {
            await interaction.reply({ content: "Пользователь не найден. Подключите свою учетную запись повторно или проверьте введенное имя учетной записи.", ephemeral: true });
            return;
        }

        const profile = apiProfile.data as ProfileInfo;

        const embed = Embed()
            .setTitle(`Профиль ${profile.username}`)

        if(profile.profile.bio) {
            embed.setDescription(profile.profile.bio);
        }

        if(profile.profile.avatar && profile.profile.avatar.startsWith("http")) {
            embed.setThumbnail(profile.profile.avatar);
        }

        const profileButton = new ButtonBuilder()
            .setLabel("Посмотреть профиль")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://enka.network/u/${profile.username}/`)

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(profileButton)] });
    },
} satisfies Command;
