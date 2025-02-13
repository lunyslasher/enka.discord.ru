import { Command } from "../../../types/discord";
import {MessageFlagsBitField} from "discord.js";

export default {
    custom_id: "account_disconnect_cancel",
    role: "BUTTON",
    run: async (interaction) => {
        if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                flags: MessageFlagsBitField.Flags.Ephemeral,
            });
        }
        await interaction.update({ content: "Отключение отменено", embeds: [], components: [] });
    },
} satisfies Command;
