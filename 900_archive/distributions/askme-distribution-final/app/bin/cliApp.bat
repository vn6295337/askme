@rem
@rem Copyright 2015 the original author or authors.
@rem
@rem Licensed under the Apache License, Version 2.0 (the "License");
@rem you may not use this file except in compliance with the License.
@rem You may obtain a copy of the License at
@rem
@rem      https://www.apache.org/licenses/LICENSE-2.0
@rem
@rem Unless required by applicable law or agreed to in writing, software
@rem distributed under the License is distributed on an "AS IS" BASIS,
@rem WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@rem See the License for the specific language governing permissions and
@rem limitations under the License.
@rem

@if "%DEBUG%"=="" @echo off
@rem ##########################################################################
@rem
@rem  cliApp startup script for Windows
@rem
@rem ##########################################################################

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
@rem This is normally unused
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%..

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and CLI_APP_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS=

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute

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

set CLASSPATH=%APP_HOME%\lib\cliApp.jar;%APP_HOME%\lib\kotlinx-cli-jvm-0.3.4.jar;%APP_HOME%\lib\ktor-client-cio-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-client-content-negotiation-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-client-core-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-serialization-kotlinx-json-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-events-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-websocket-serialization-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-http-cio-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-serialization-kotlinx-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-serialization-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-websockets-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-network-tls-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-http-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-network-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-utils-jvm-2.3.6.jar;%APP_HOME%\lib\ktor-io-jvm-2.3.6.jar;%APP_HOME%\lib\kotlinx-coroutines-jdk8-1.7.3.jar;%APP_HOME%\lib\kotlinx-coroutines-core-jvm-1.7.3.jar;%APP_HOME%\lib\kotlinx-coroutines-slf4j-1.7.3.jar;%APP_HOME%\lib\kotlin-stdlib-jdk8-1.9.10.jar;%APP_HOME%\lib\kotlinx-serialization-json-jvm-1.6.0.jar;%APP_HOME%\lib\kotlinx-serialization-core-jvm-1.6.0.jar;%APP_HOME%\lib\slf4j-simple-2.0.9.jar;%APP_HOME%\lib\kotlin-stdlib-jdk7-1.9.10.jar;%APP_HOME%\lib\kotlin-stdlib-1.9.10.jar;%APP_HOME%\lib\slf4j-api-2.0.9.jar;%APP_HOME%\lib\kotlin-stdlib-common-1.9.10.jar;%APP_HOME%\lib\annotations-23.0.0.jar


@rem Execute cliApp
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %CLI_APP_OPTS%  -classpath "%CLASSPATH%" com.askme.cli.MainKt %*

:end
@rem End local scope for the variables with windows NT shell
if %ERRORLEVEL% equ 0 goto mainEnd

:fail
rem Set variable CLI_APP_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd.exe /c_ return code!
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
if not ""=="%CLI_APP_EXIT_CONSOLE%" exit %EXIT_CODE%
exit /b %EXIT_CODE%

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
