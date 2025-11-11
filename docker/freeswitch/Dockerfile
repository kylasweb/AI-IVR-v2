# FreeSWITCH Dockerfile for FairGo Telephony Gateway
FROM debian:bullseye-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    lsb-release \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Add FreeSWITCH repository
RUN wget -O - https://files.freeswitch.org/repo/deb/debian-release/freeswitch_archive_g0.pub | apt-key add -
RUN echo "deb http://files.freeswitch.org/repo/deb/debian-release/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/freeswitch.list

# Install FreeSWITCH
RUN apt-get update && apt-get install -y \
    freeswitch \
    freeswitch-mod-commands \
    freeswitch-mod-dptools \
    freeswitch-mod-loopback \
    freeswitch-mod-sofia \
    freeswitch-mod-esl \
    freeswitch-mod-event-socket \
    freeswitch-mod-xml-curl \
    freeswitch-mod-json-cdr \
    freeswitch-mod-verto \
    freeswitch-mod-rtmp \
    freeswitch-mod-skinny \
    freeswitch-mod-sndfile \
    freeswitch-mod-native-file \
    freeswitch-mod-local-stream \
    freeswitch-mod-tone-stream \
    freeswitch-mod-lua \
    && rm -rf /var/lib/apt/lists/*

# Create FreeSWITCH user
RUN useradd -r -s /bin/false freeswitch

# Create directories
RUN mkdir -p /etc/freeswitch /var/lib/freeswitch /var/log/freeswitch /usr/share/freeswitch/sounds
RUN chown -R freeswitch:freeswitch /etc/freeswitch /var/lib/freeswitch /var/log/freeswitch /usr/share/freeswitch

# Copy configuration files
COPY conf/ /etc/freeswitch/

# Set proper permissions
RUN chown -R freeswitch:freeswitch /etc/freeswitch

# Expose ports
EXPOSE 5060/udp
EXPOSE 5060/tcp
EXPOSE 5080/udp
EXPOSE 5080/tcp
EXPOSE 8021/tcp
EXPOSE 16384-32768/udp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD fs_cli -x "status" | grep -q "FreeSWITCH" || exit 1

# Switch to freeswitch user
USER freeswitch

# Start FreeSWITCH
CMD ["/usr/bin/freeswitch", "-c", "-nf"]