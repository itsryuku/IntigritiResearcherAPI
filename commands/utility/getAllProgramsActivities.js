const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("programs_activities")
    .setDescription(
      "This command returns program activities that you have access to the details of the program."
    ),
  async execute(interaction) {
    try {
      const activitiesResponse = await fetchData(
        "/external/researcher/v1/programs/activities"
      );
      const programsResponse = await fetchData(
        "/external/researcher/v1/programs"
      );

      const activities = activitiesResponse.records;
      const programsMap = new Map(
        programsResponse.records.map((program) => [program.id, program.name])
      );

      const embed = {
        color: 0x0099ff,
        title: "Programs Activities",
        fields: activities.map((activity) => ({
          name: `Program ID: ${activity.programId}`,
          value:
            `**Program Name:** ${programsMap.get(activity.programId)}\n` +
            `**Type:** ${activity.type.value}\n` +
            `**Created At:** ${new Date(
              activity.createdAt * 1000
            ).toLocaleString()}`,
        })),
        timestamp: new Date(),
        footer: {
          text: "IntigritiHelper",
        },
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(
        "[command programs_activities] Error fetching programs activities:",
        error
      );
      await interaction.reply(
        "Something went wrong, check console for errors."
      );
    }
  },
};
