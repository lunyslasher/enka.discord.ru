import { Command } from "../../../types/discord";
import {NoProfile, ProfileInfo} from "../../../types/enka";
import {userVerifCodes} from "../../../utils/temp";
import {api, get} from "../../../utils/api";
import {generateRandomCapitalString} from "../../../utils/misc";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {connectAccountEmbed, Embed} from "../../../utils/embeds";

export default {
    name: "connect",
    role: "CHAT_INPUT",
    description: "Подключите свою учетную запись Discord к своей учетной записи enka.network.",
    options: [
        {
            type: 3,
            name: "name",
            description: "Имя учетной записи, которую вы хотите подключить",
            required: true,
        },
    ],
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) =>  {
        await interaction.deferReply({ ephemeral: true })
        const name = interaction.options.getString("name", true);
        const response = await api.profile(name);
        if (!response) {
            await interaction.editReply({ content: "Пользователь не найден" });
            return;
        }
        const profile = response.data as ProfileInfo;
        const code = generateRandomCapitalString(6);
        userVerifCodes.setCode(interaction.user.id, {
            code,
            name
        });
        const embed = connectAccountEmbed(profile, code);

        const verifyButton = new ButtonBuilder()
            .setCustomId("account_connect")
            .setLabel("Подвердить")
            .setStyle(ButtonStyle.Success)

        const cancelButton = new ButtonBuilder()
            .setCustomId("account_connect_cancel")
            .setLabel("Отменить")
            .setStyle(ButtonStyle.Danger)

        await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().setComponents(verifyButton, cancelButton)] });
    },
} satisfies Command;
