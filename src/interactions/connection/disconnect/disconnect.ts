import { Command } from "../../../types/discord";
import {NoProfile, ProfileInfo} from "../../../types/enka";
import {userVerifCodes} from "../../../utils/temp";
import {get} from "../../../utils/api";
import {generateRandomCapitalString} from "../../../utils/misc";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {connectAccountEmbed, Embed} from "../../../utils/embeds";
import {db} from "../../../utils/db";
import {users} from "../../../schema";
import {eq} from "drizzle-orm";

export default {
    name: "disconnect",
    role: "CHAT_INPUT",
    description: "Отвяжите свою учетную запись enka.network",
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) =>  {
        await interaction.deferReply({ ephemeral: true })

        const user = await db.query.users.findFirst({ where: eq(users.id, interaction.user.id) });

        if(!user || !user.enka_name) {
            await interaction.editReply({ content: "У вас не связан аккаунт" });
            return;
        }

        const embed = Embed()
            .setTitle("Disconnect account")
            .setDescription("Вы уверены, что хотите отвязать свою учетную запись enka.network??")

        const disconnectButton = new ButtonBuilder()
            .setCustomId("account_disconnect")
            .setLabel("Отвязать")
            .setStyle(ButtonStyle.Danger)

        const cancelButton = new ButtonBuilder()
            .setCustomId("account_disconnect_cancel")
            .setLabel("Отмена")
            .setStyle(ButtonStyle.Primary)

        await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().setComponents(disconnectButton, cancelButton)] });
    },
} satisfies Command;
