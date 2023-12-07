const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  // Define the slash command
  data: new SlashCommandBuilder()
    .setName("get_domains")
    .setDescription("Get domains for a specific program.")
    .addStringOption((option) =>
      option
        .setName("program_name")
        .setDescription("The name of the program to get details for.")
        .setRequired(true)
    ),
  // Execute the command
  async execute(interaction) {
    try {
      // Defer the reply until the data is fetched
      await interaction.deferReply();

      // Get the program name from the interaction options
      const programName = interaction.options.getString("program_name");

      // Fetch all programs
      const allProgramsResponse = await fetchData(
        "/external/researcher/v1/programs"
      );

      // Find the target program from the fetched programs
      const targetProgram = allProgramsResponse.records.find(
        (program) => program.name.toLowerCase() === programName.toLowerCase()
      );

      // If the target program is not found, send an error message
      if (!targetProgram) {
        return interaction.editReply(`No program **"${programName}"**.`);
      }

      // Get the ID of the target program
      const programId = targetProgram.id;

      // Fetch all program activities
      const programsActivitiesResponse = await fetchData(
        "/external/researcher/v1/programs/activities"
      );

      // Find the matching activity from the fetched activities
      const matchingActivity = programsActivitiesResponse.records.find(
        (record) =>
          record.programId === programId &&
          record.type.value === "New domains version added"
      );

      // If the matching activity is not found, send an error message
      if (!matchingActivity) {
        return interaction.editReply(
          `Could not find **"${programName}"**. at /programs/activities for some reason.`
        );
      }

      // Get the version ID from the matching activity
      const versionID = matchingActivity.activity.toVersionId;

      // Fetch the domains of the target program
      const programDomainsResponse = await fetchData(
        `/external/researcher/v1/programs/${programId}/domains/${versionID}`
      );
      // Get the domains from the response
      const domains = programDomainsResponse.domains.content;

      // Initialize the reply content with the program and version IDs
      let replyContent = `Domains for Program ID ${programId} (Version ID: ${versionID}):\n`;

      // Loop over the domains
      domains.forEach((domain) => {
        // Create a message for each domain with its details
        const domainMessage = `Domain ID: ${domain.id}
          Type: ${domain.type.value}
          Endpoint: ${domain.endpoint}
          Tier: ${domain.tier.value}\n\n`;

        // Add the domain message to the reply content
        replyContent += domainMessage;
      });

      // Send the reply with the domains details
      await interaction.editReply(replyContent);
    } catch (error) {
      // Log any errors
      console.error("Error fetching program domains:", error);

      // Send an error message
      await interaction.editReply(
        "An error occurred while fetching program domains."
      );
    }
  },
};
