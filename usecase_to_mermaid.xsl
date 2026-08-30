<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!--
    usecase_to_mermaid.xsl / 2.2.2유즈케이스명세서.XSL
    BizWiz 유즈케이스 명세서 XML -> Mermaid Use Case Diagram (graph LR) 변환 XSLT
  -->
  <xsl:output method="text" encoding="UTF-8"/>

  <xsl:variable name="dq">&quot;</xsl:variable>
  <xsl:variable name="sq">&apos;</xsl:variable>
  <xsl:variable name="badChars" select="concat(' ()/.-&lt;&gt;:,[]{}&#10;&#13;', $dq, $sq)"/>
  <xsl:variable name="replChars" select="'____________________'"/>

  <!-- 줄바꿈 -->
  <xsl:template name="NL">
    <xsl:text>&#10;</xsl:text>
  </xsl:template>

  <!-- 들여쓰기 4자 -->
  <xsl:template name="INDENT">
    <xsl:text>    </xsl:text>
  </xsl:template>

  <!-- 들여쓰기 8자 -->
  <xsl:template name="INDENT2">
    <xsl:text>        </xsl:text>
  </xsl:template>

  <!-- SafeId: 특수문자를 언더스코어로 변환하여 Mermaid Node ID 생성 -->
  <xsl:template name="SafeId">
    <xsl:param name="val"/>
    <xsl:variable name="s1" select="translate($val, $badChars, $replChars)"/>
    <xsl:choose>
      <xsl:when test="string-length($s1) &gt; 0">
        <xsl:value-of select="$s1"/>
      </xsl:when>
      <xsl:otherwise>Node_ID</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- 유즈케이스 노드 ID 추출 헬퍼 -->
  <xsl:template name="GetUcId">
    <xsl:param name="node"/>
    <xsl:choose>
      <xsl:when test="$node/phname/text() != ''">
        <xsl:call-template name="SafeId">
          <xsl:with-param name="val" select="$node/phname/text()"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$node/id/text() != ''">
        <xsl:call-template name="SafeId">
          <xsl:with-param name="val" select="concat('UC_', $node/id/text())"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="SafeId">
          <xsl:with-param name="val" select="concat('UC_', $node/name/text())"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- 메인 루트 템플릿: graph LR 기반 유즈케이스 다이어그램 -->
  <xsl:template match="/">
    <xsl:text>graph LR</xsl:text>
    <xsl:call-template name="NL"/>
    <xsl:call-template name="NL"/>

    <!-- Actor 클래스 목록 추출 -->
    <xsl:variable name="author" select="//class[stereo = 'actor']" />

    <!-- 1. 액터 노드 선언 -->
    <xsl:for-each select="$author">
      <xsl:variable name="actorId">
        <xsl:call-template name="SafeId">
          <xsl:with-param name="val" select="concat('Actor_', phname/text())"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:value-of select="$actorId"/>
      <xsl:text>(["👤 </xsl:text>
      <xsl:value-of select="name/text()"/>
      <xsl:text>"])</xsl:text>
      <xsl:call-template name="NL"/>
    </xsl:for-each>
    <xsl:call-template name="NL"/>

    <!-- 2. 유즈케이스 서브그래프 -->
    <xsl:text>    subgraph UC ["유즈케이스"]</xsl:text>
    <xsl:call-template name="NL"/>

    <xsl:for-each select="//usecase">
      <xsl:call-template name="RenderSingleUsecase"/>
    </xsl:for-each>

    <xsl:text>    end</xsl:text>
    <xsl:call-template name="NL"/>
    <xsl:call-template name="NL"/>

    <!-- 3. Include 관계 연결 -->
    <xsl:for-each select="//usecase">
      <xsl:call-template name="IncludeUsecase"/>
    </xsl:for-each>
  </xsl:template>

  <!-- 단일 유즈케이스 렌더링 템플릿 -->
  <xsl:template name="RenderSingleUsecase">
    <xsl:variable name="currentUc">
      <xsl:call-template name="GetUcId">
        <xsl:with-param name="node" select="."/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:variable name="ucName" select="name/text()"/>
    <xsl:variable name="ucPhName" select="phname/text()"/>

    <!-- Usecase 기본 노드 정의 (( ... )) -->
    <xsl:call-template name="INDENT2"/>
    <xsl:value-of select="$currentUc"/>
    <xsl:text>(["</xsl:text>
    <xsl:value-of select="$ucName"/>
    <xsl:if test="$ucPhName != '' and $ucPhName != $ucName">
      <xsl:text>&lt;br/&gt;[</xsl:text>
      <xsl:value-of select="$ucPhName"/>
      <xsl:text>]</xsl:text>
    </xsl:if>
    <xsl:text>"])</xsl:text>
    <xsl:call-template name="NL"/>

    <!-- 액터 연동 처리 -->
    <xsl:variable name="actorVal">
      <xsl:choose>
        <xsl:when test="authority/text() != ''"><xsl:value-of select="authority/text()"/></xsl:when>
        <xsl:when test="auth/text() != ''"><xsl:value-of select="auth/text()"/></xsl:when>
      </xsl:choose>
    </xsl:variable>

    <xsl:if test="$actorVal != ''">
      <xsl:variable name="actorId">
        <xsl:call-template name="SafeId">
          <xsl:with-param name="val" select="concat('Actor_', $actorVal)"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:call-template name="INDENT2"/>
      <xsl:value-of select="$actorId"/>
      <xsl:text> --&gt; </xsl:text>
      <xsl:value-of select="$currentUc"/>
      <xsl:call-template name="NL"/>
    </xsl:if>
  </xsl:template>

  <!-- Include 관계 템플릿 -->
  <xsl:template name="IncludeUsecase">
    <xsl:variable name="currentUc">
      <xsl:call-template name="GetUcId">
        <xsl:with-param name="node" select="."/>
      </xsl:call-template>
    </xsl:variable>

    <!-- Includes 및 Includeds 모두 지원 -->
    <xsl:for-each select="Includes/include | includes/include | Includeds/included | includeds/included">
      <xsl:variable name="targetName" select="name/text()"/>
      <xsl:variable name="targetPhname" select="phname/text()"/>

      <xsl:variable name="includedUcId">
        <xsl:choose>
          <xsl:when test="$targetPhname != ''">
            <xsl:call-template name="SafeId">
              <xsl:with-param name="val" select="$targetPhname"/>
            </xsl:call-template>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="SafeId">
              <xsl:with-param name="val" select="concat('UC_', $targetName)"/>
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:variable>

      <xsl:call-template name="INDENT"/>
      <xsl:value-of select="$currentUc"/>
      <xsl:text> -. &quot;&amp;lt;&amp;lt;include&amp;gt;&amp;gt;&quot; .-&gt; </xsl:text>
      <xsl:value-of select="$includedUcId"/>
      <xsl:call-template name="NL"/>
    </xsl:for-each>
  </xsl:template>

</xsl:stylesheet>