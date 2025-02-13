import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlagsBitField} from "discord.js";
import { Command } from "../../../types/discord";
import { commands } from "../../../index";
import {EmbedBuilder} from "../../../utils/embeds";

export default {
    name: "help",
    role: "CHAT_INPUT",
    description: "Получить помощь по боту",
    contexts: [0, 1, 2],
    integration_types: [0, 1],
    run: async (interaction) => {
        const embed_ = new EmbedBuilder()
            .setTitle("Help")
            .setDescription(
                "Получите помощь по боту, перейдя через команды ниже.",
            );

        let fields: { name: string; value: string }[] = [];

        for (const [name, command] of commands) {
            if (command.role === "CHAT_INPUT")
                fields.push({ name: name, value: command.description });
        }

        let pagify = false;

        if (fields.length > 10) {
            const pageCount = Math.ceil(fields.length / 10);
            pagify = true;
            fields = fields.slice(0, 10);
            embed_.setFooter({
                text: `Страница 1 из ${pageCount}`
            });
        }

        embed_.addFields(fields);

        if (pagify) {
            const previous = new ButtonBuilder()
                .setCustomId("previous")
                .setLabel("Назад")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);
            const next = new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Далее")
                .setStyle(ButtonStyle.Primary);
            const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
                previous,
                next,
            );
            return await interaction.reply({
                embeds: [embed_],
                components: [row],
                flags: MessageFlagsBitField.Flags.Ephemeral,
            });
        }
        await interaction.reply({ embeds: [embed_],
            flags: MessageFlagsBitField.Flags.Ephemeral, });
    },
} satisfies Command;