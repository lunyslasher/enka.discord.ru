import { Command } from "../../../types/discord";
import {userVerifCodes} from "../../../utils/temp";
import {MessageFlagsBitField} from "discord.js";

export default {
    custom_id: "account_connect_cancel",
    role: "BUTTON",
    run: async (interaction) => {
        if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                flags: MessageFlagsBitField.Flags.Ephemeral,
            });
        }
        userVerifCodes.delete(interaction.user.id);
        await interaction.update({ content: "Подключение отменено", embeds: [], components: [] });
    },
} satisfies Command;
