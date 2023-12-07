const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  // Define the slash command
  data: new SlashCommandBuilder()
    .setName("programs_activities")
    .setDescription(
      "This command returns program activities that you have access to the details of the program."
    ),
  // Execute the command
  async execute(interaction) {
    try {
      // Defer the reply until the data is fetched
      await interaction.deferReply();

      // Fetch the activities and programs data from the API
      const activitiesResponse = await fetchData(
        "/external/researcher/v1/programs/activities?limit=200"
      );
      const programsResponse = await fetchData(
        "/external/researcher/v1/programs?limit=200"
      );

      // Extract the activities records and create a map of program IDs to names
      const activities = activitiesResponse.records;
      const programsMap = new Map(
        programsResponse.records.map((program) => [program.id, program.name])
      );

      // Create an embed message with the activities details
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

      // Send the embed message
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      // Log any errors
      console.error(
        "[command programs_activities] Error fetching programs activities:",
        error
      );
      // Send an error message
      await interaction.editReply(
        "Something went wrong, check console for errors."
      );
    }
  },
};
