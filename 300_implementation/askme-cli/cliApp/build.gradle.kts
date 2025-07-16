plugins {
    kotlin("jvm") version "1.9.10"
    kotlin("plugin.serialization") version "1.9.10"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-cli:0.3.4")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    implementation("io.ktor:ktor-client-core:2.3.6")
    implementation("io.ktor:ktor-client-cio:2.3.6")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.6")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.6")
    implementation("org.slf4j:slf4j-simple:2.0.9")
    
    testImplementation(kotlin("test"))
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
}

application {
    mainClass.set("com.askme.cli.MainKt")
}

kotlin {
    jvmToolchain(17)
}

// ROOT CAUSE FIX: Generate compact startup scripts under 4KB
tasks.named<CreateStartScripts>("startScripts") {
    doLast {
        // Replace the large CLASSPATH with compact wildcard version
        val unixScript = unixScript
        val windowsScript = windowsScript
        
        // Generate compact Unix script
        val compactUnixScript = generateCompactUnixScript()
        unixScript.writeText(compactUnixScript)
        
        // Generate compact Windows script  
        val compactWindowsScript = generateCompactWindowsScript()
        windowsScript.writeText(compactWindowsScript)
        
        println("✅ Generated compact startup scripts (under 4KB)")
        println("   Unix script: ${unixScript.readText().length} bytes")
        println("   Windows script: ${windowsScript.readText().length} bytes")
    }
}

fun generateCompactUnixScript(): String = """#!/bin/sh

#
# Copyright © 2015-2021 the original authors.
# Licensed under the Apache License, Version 2.0
#

##############################################################################
#   cliApp start up script - COMPACT VERSION
#   ROOT CAUSE FIX: Uses JVM wildcard CLASSPATH to stay under 4KB
##############################################################################

# Resolve links: ${'$'}0 may be a link
app_path=${'$'}0

# Need this for daisy-chained symlinks.
while
    APP_HOME=${'$'}{app_path%"${'$'}{app_path##*/}"}  # leaves a trailing /; empty if no leading path
    [ -h "${'$'}app_path" ]
do
    ls=${'$'}( ls -ld "${'$'}app_path" )
    link=${'$'}{ls#*' -> '}
    case ${'$'}link in             #(
      /*)   app_path=${'$'}link ;; #(
      *)    app_path=${'$'}APP_HOME${'$'}link ;;
    esac
done

APP_BASE_NAME=${'$'}{0##*/}
APP_HOME=${'$'}( cd "${'$'}{APP_HOME:-./}.." > /dev/null && pwd -P ) || exit

# Use maximum available file descriptors
MAX_FD=maximum

warn () {
    echo "${'$'}*"
} >&2

die () {
    echo
    echo "${'$'}*"
    echo
    exit 1
} >&2

# OS specific support
cygwin=false
msys=false
darwin=false
nonstop=false
case "${'$'}( uname )" in                #(
  CYGWIN* )         cygwin=true  ;; #(
  Darwin* )         darwin=true  ;; #(
  MSYS* | MINGW* )  msys=true    ;; #(
  NONSTOP* )        nonstop=true ;;
esac

# COMPACT CLASSPATH: Use JVM wildcard instead of listing all 29 JARs
CLASSPATH=${'$'}APP_HOME/lib/*

# Determine the Java command to use
if [ -n "${'$'}JAVA_HOME" ] ; then
    if [ -x "${'$'}JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD=${'$'}JAVA_HOME/jre/sh/java
    else
        JAVACMD=${'$'}JAVA_HOME/bin/java
    fi
    if [ ! -x "${'$'}JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: ${'$'}JAVA_HOME

Please set the JAVA_HOME variable to match the location of your Java installation."
    fi
else
    JAVACMD=java
    if ! command -v java >/dev/null 2>&1
    then
        die "ERROR: JAVA_HOME is not set and no 'java' command could be found.

Please set the JAVA_HOME variable to match the location of your Java installation."
    fi
fi

# Increase file descriptors if we can
if ! "${'$'}cygwin" && ! "${'$'}darwin" && ! "${'$'}nonstop" ; then
    case ${'$'}MAX_FD in #(
      max*)
        if ! MAX_FD=${'$'}( ulimit -H -n ) ||
           [ ${'$'}MAX_FD -eq -1 ]
        then
            MAX_FD=8192
        fi ;;
    esac
    case ${'$'}MAX_FD in  #(
      '' | soft) :;; #(
      *)
        ulimit -n "${'$'}MAX_FD" ||
            warn "Could not set maximum file descriptor limit: ${'$'}MAX_FD"
    esac
fi

# Collect all arguments for the java command
set -- \
        "-Dorg.gradle.appname=${'$'}APP_BASE_NAME" \
        -classpath "${'$'}CLASSPATH" \
        com.askme.cli.MainKt \
        "${'$'}@"

# Stop option parsing and run java
exec "${'$'}JAVACMD" "${'$'}@"
""".trimIndent()

fun generateCompactWindowsScript(): String = """@rem
@rem Copyright 2015 the original author or authors.
@rem Licensed under the Apache License, Version 2.0
@rem

@rem cliApp startup script - COMPACT VERSION  
@rem ROOT CAUSE FIX: Uses wildcard CLASSPATH to stay under 4KB

@if "%DEBUG%"=="" @echo off
@rem Setup the command line

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%..

@rem Resolve any "." and ".." in APP_HOME  
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here
set DEFAULT_JVM_OPTS=

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%"=="0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.
goto fail

:execute
@rem Setup the command line

@rem COMPACT CLASSPATH: Use wildcard instead of listing all JARs
set CLASSPATH=%APP_HOME%\lib\*

@rem Execute cliApp
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %CLI_APP_OPTS% -classpath "%CLASSPATH%" com.askme.cli.MainKt %*

:end
@rem End local scope for the variables with windows NT shell
if "%ERRORLEVEL%"=="0" goto mainEnd

:fail
rem Set variable CLI_APP_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
if not "" == "%CLI_APP_EXIT_CONSOLE%" exit 1
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
""".trimIndent()

tasks.register("atomicBuild") {
    dependsOn("clean", "installDist")
    doLast {
        val installDir = layout.buildDirectory.dir("install/cliApp").get().asFile
        val tempDir = File(installDir.parent, "temp-build")
        
        // Atomic operation: build to temp, then move
        if (tempDir.exists()) tempDir.deleteRecursively()
        installDir.copyRecursively(tempDir)
        
        // Verify temp build before replacing - UPDATED for compact scripts
        val script = File(tempDir, "bin/cliApp")
        if (!script.exists() || script.readText().length > 4000) {
            tempDir.deleteRecursively()
            throw RuntimeException("Atomic build failed: script too large (${script.readText().length} bytes > 4000)")
        }
        
        // Replace original with verified build
        installDir.deleteRecursively()
        tempDir.renameTo(installDir)
    }
}
