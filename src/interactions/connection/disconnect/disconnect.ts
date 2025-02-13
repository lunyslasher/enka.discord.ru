import { Command } from "../../../types/discord";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField} from "discord.js";
import {db} from "../../../utils/db";
import {users} from "../../../schema";
import {eq} from "drizzle-orm";
import {EmbedBuilder} from "../../../utils/embeds";

export default {
    name: "disconnect",
    role: "CHAT_INPUT",
    description: "Отключите свою учетную запись enka.network от Discord",
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) =>  {
        await interaction.deferReply({ flags: MessageFlagsBitField.Flags.Ephemeral });

        const user = await db.query.users.findFirst({ where: eq(users.id, interaction.user.id) });

        if(!user || !user.enka_name) {
            await interaction.editReply({ content: "У вас нет привязанной учетной записи" });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle("Disconnect account")
            .setDescription("Вы уверены, что хотите отключить свою учетную запись enka.network от Discord?")

        const disconnectButton = new ButtonBuilder()
            .setCustomId("account_disconnect")
            .setLabel("Отключить")
            .setStyle(ButtonStyle.Danger)

        const cancelButton = new ButtonBuilder()
            .setCustomId("account_disconnect_cancel")
            .setLabel("Отмена")
            .setStyle(ButtonStyle.Primary)

        await interaction.editReply({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().setComponents(disconnectButton, cancelButton)] });
    },
} satisfies Command;
