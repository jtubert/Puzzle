<!-- First describe a classpath where your antsvn zip-package is unpacked -->
<path id="myoldaunt.classpath">
    <fileset dir="/usr/local/antsvn">
        <include name="**/*.jar"/>
    </fileset>
</path>

<!-- Next bind the svn-task to the classpath and describe,
 which class to run in the package -->
<taskdef name="svn" classname="org.tigris.subversion.svnant.SvnTask"
 classpathref="myoldaunt.classpath" />
